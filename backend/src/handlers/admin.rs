// Handlers - Admin Handlers

use actix_web::{web, HttpResponse, Responder};
use crate::infrastructure::AppState;

/// 管理员获取所有用户
pub async fn get_all_users(state: web::Data<AppState>) -> impl Responder {
    let users = state.users.lock().unwrap();
    let user_list: Vec<_> = users.values().map(|u| {
        serde_json::json!({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "created_at": u.created_at,
            "kyc_level": u.kyc_level,
        })
    }).collect();
    
    HttpResponse::Ok().json(serde_json::json!({
        "users": user_list,
        "total": user_list.len()
    }))
}

/// 管理员获取所有订单
pub async fn get_all_orders(
    state: web::Data<AppState>,
    query: web::Query<std::collections::HashMap<String, String>>,
) -> impl Responder {
    let orders = state.orders.lock().unwrap();
    let mut order_list: Vec<_> = orders.values().map(|o| {
        serde_json::json!({
            "id": o.id,
            "user_id": o.user_id,
            "symbol": o.symbol,
            "side": o.side,
            "order_type": o.order_type,
            "price": o.price,
            "quantity": o.quantity,
            "filled": o.filled,
            "status": o.status,
            "created_at": o.created_at,
        })
    }).collect();
    
    // Apply filters if provided
    if let Some(symbol) = query.get("symbol") {
        order_list.retain(|o| o["symbol"] == *symbol);
    }
    if let Some(status) = query.get("status") {
        order_list.retain(|o| o["status"] == *status);
    }
    
    HttpResponse::Ok().json(serde_json::json!({
        "orders": order_list,
        "total": order_list.len()
    }))
}

/// 管理员获取所有交易记录
pub async fn get_all_transactions(
    state: web::Data<AppState>,
) -> impl Responder {
    let transactions = state.transactions.lock().unwrap();
    let mut tx_list: Vec<_> = Vec::new();
    
    for (_user_id, txs) in transactions.iter() {
        for t in txs {
            tx_list.push(serde_json::json!({
                "id": t.id,
                "user_id": t.user_id,
                "tx_type": t.tx_type,
                "currency": t.currency,
                "amount": t.amount,
                "status": t.status,
                "created_at": t.created_at,
            }));
        }
    }
    
    HttpResponse::Ok().json(serde_json::json!({
        "transactions": tx_list,
        "total": tx_list.len()
    }))
}

/// 管理员获取系统统计
pub async fn get_system_stats(state: web::Data<AppState>) -> impl Responder {
    let users = state.users.lock().unwrap();
    let orders = state.orders.lock().unwrap();
    let transactions = state.transactions.lock().unwrap();
    
    let total_users = users.len();
    let total_orders = orders.len();
    
    // Count transactions
    let mut total_transactions = 0;
    for (_user_id, txs) in transactions.iter() {
        total_transactions += txs.len();
    }
    
    // Calculate total volume
    let total_volume: f64 = orders.values()
        .filter(|o| o.status == "filled")
        .map(|o| o.price * o.filled)
        .sum();
    
    HttpResponse::Ok().json(serde_json::json!({
        "total_users": total_users,
        "total_orders": total_orders,
        "total_transactions": total_transactions,
        "total_volume": total_volume,
        "timestamp": chrono::Utc::now().timestamp()
    }))
}

/// 管理员取消订单
pub async fn admin_cancel_order(
    state: web::Data<AppState>,
    order_id: web::Path<String>,
) -> impl Responder {
    let mut orders = state.orders.lock().unwrap();
    
    if let Some(order) = orders.get_mut(&order_id.to_string()) {
        if order.status == "filled" {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "Cannot cancel filled order"
            }));
        }
        order.status = "cancelled".to_string();
        HttpResponse::Ok().json(serde_json::json!({
            "success": true,
            "order_id": order_id.to_string(),
            "status": "cancelled"
        }))
    } else {
        HttpResponse::NotFound().json(serde_json::json!({
            "error": "Order not found"
        }))
    }
}
