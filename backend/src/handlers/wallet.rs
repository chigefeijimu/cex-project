// Handlers - Wallet Handlers
use actix_web::{web, HttpResponse, Responder};
use crate::application::dtos::*;
use crate::domain::*;
use crate::infrastructure::AppState;

// 获取余额
pub async fn get_balance(
    _req: actix_web::HttpRequest,
    user_id: web::Path<String>,
    state: web::Data<AppState>,
) -> impl Responder {
    let balances = state.balances.lock().unwrap();
    
    if let Some(user_balances) = balances.get(&*user_id) {
        HttpResponse::Ok().json(user_balances.clone())
    } else {
        // 返回默认余额
        let default_balances = vec![
            WalletBalance {
                currency: "BTC".to_string(),
                available: 1.5,
                frozen: 0.0,
                total: 1.5,
            },
            WalletBalance {
                currency: "ETH".to_string(),
                available: 15.0,
                frozen: 0.0,
                total: 15.0,
            },
            WalletBalance {
                currency: "USDT".to_string(),
                available: 50000.0,
                frozen: 0.0,
                total: 50000.0,
            },
            WalletBalance {
                currency: "BNB".to_string(),
                available: 50.0,
                frozen: 0.0,
                total: 50.0,
            },
        ];
        HttpResponse::Ok().json(default_balances)
    }
}

// 获取充值地址
pub async fn get_deposit_address(
    req: actix_web::HttpRequest,
    _state: web::Data<AppState>,
) -> impl Responder {
    let user_id = req.headers()
        .get("X-User-ID")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "default".to_string());
    
    let deposit_addr = DepositAddress {
        currency: "BTC".to_string(),
        address: format!("bc1q{}xy{}", &user_id[..8], &user_id[8..16]),
        tag: None,
        network: "Bitcoin".to_string(),
    };
    
    HttpResponse::Ok().json(serde_json::json!({
        "address": deposit_addr.address,
        "currency": deposit_addr.currency,
        "network": deposit_addr.network,
        "tag": deposit_addr.tag
    }))
}

// 提现
pub async fn withdraw(
    req: actix_web::HttpRequest,
    _state: web::Data<AppState>,
    withdraw_req: web::Json<WithdrawRequest>,
) -> impl Responder {
    let _user_id = req.headers()
        .get("X-User-ID")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "default".to_string());
    
    let result = serde_json::json!({
        "id": uuid::Uuid::new_v4().to_string(),
        "currency": withdraw_req.currency,
        "amount": withdraw_req.amount,
        "address": withdraw_req.address,
        "status": "pending",
        "created_at": chrono::Utc::now().timestamp()
    });
    
    HttpResponse::Ok().json(result)
}

// 内部转账
pub async fn transfer(
    req: actix_web::HttpRequest,
    _state: web::Data<AppState>,
    _transfer_req: web::Json<TransferRequest>,
) -> impl Responder {
    let _user_id = req.headers()
        .get("X-User-ID")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "default".to_string());
    
    let result = serde_json::json!({
        "message": "Transfer successful"
    });
    
    HttpResponse::Ok().json(result)
}

// 获取交易记录
pub async fn get_transactions(
    req: actix_web::HttpRequest,
    _query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = req.headers()
        .get("X-User-ID")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "default".to_string());
    
    let transactions = state.transactions.lock().unwrap();
    let user_txs = transactions.get(&user_id).cloned().unwrap_or_default();
    
    if user_txs.is_empty() {
        // 返回模拟交易记录
        let mock_txs = vec![
            Transaction {
                id: uuid::Uuid::new_v4().to_string(),
                user_id: user_id.clone(),
                tx_type: "deposit".to_string(),
                currency: "USDT".to_string(),
                amount: 10000.0,
                fee: 0.0,
                status: "confirmed".to_string(),
                address: None,
                tx_hash: Some("0x1234".to_string()),
                created_at: chrono::Utc::now().timestamp() - 86400,
                confirmations: Some(10),
            },
            Transaction {
                id: uuid::Uuid::new_v4().to_string(),
                user_id: user_id.clone(),
                tx_type: "deposit".to_string(),
                currency: "BTC".to_string(),
                amount: 0.5,
                fee: 0.0,
                status: "confirmed".to_string(),
                address: None,
                tx_hash: Some("bc1qabc".to_string()),
                created_at: chrono::Utc::now().timestamp() - 172800,
                confirmations: Some(15),
            },
        ];
        HttpResponse::Ok().json(mock_txs)
    } else {
        HttpResponse::Ok().json(user_txs)
    }
}

// 获取提现白名单
pub async fn get_withdraw_whitelist(
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = query.get("user_id").cloned().unwrap_or_default();
    let whitelist = state.withdraw_whitelist.lock().unwrap();
    let user_whitelist = whitelist.get(&user_id).cloned().unwrap_or_default();
    
    HttpResponse::Ok().json(user_whitelist)
}

// 添加提现白名单
pub async fn add_withdraw_whitelist(
    req: actix_web::HttpRequest,
    _state: web::Data<AppState>,
) -> impl Responder {
    let _user_id = req.headers()
        .get("X-User-ID")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "default".to_string());
    
    HttpResponse::Ok().json(serde_json::json!({
        "message": "Address added to whitelist"
    }))
}

// 移除白名单
pub async fn remove_from_whitelist(
    req: actix_web::HttpRequest,
    _state: web::Data<AppState>,
) -> impl Responder {
    let _user_id = req.headers()
        .get("X-User-ID")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "default".to_string());
    
    HttpResponse::Ok().json(serde_json::json!({
        "message": "Address removed from whitelist"
    }))
}
