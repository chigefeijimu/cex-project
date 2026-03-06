// Handlers - Futures, Earn, and BuyCrypto Handlers
use actix_web::{web, HttpResponse, Responder};
use crate::application::dtos::*;
use crate::domain::*;
use crate::infrastructure::AppState;

// ============ Futures Handlers ============

// 获取合约列表
pub async fn get_futures_symbols(state: web::Data<AppState>) -> impl Responder {
    let pairs = state.trading_pairs.lock().unwrap();
    let futures: Vec<FuturesContract> = pairs.values().map(|p| {
        FuturesContract {
            symbol: p.symbol.clone(),
            name: p.name.clone(),
            price: p.price,
            change_24h: p.change_24h,
            volume_24h: p.volume_24h,
            funding_rate: 0.0001,
            next_funding_time: chrono::Utc::now().timestamp() + 28800,
            leverage: "1-125x".to_string(),
            contract_type: "perpetual".to_string(),
        }
    }).collect();
    
    HttpResponse::Ok().json(futures)
}

// 获取合约 ticker
pub async fn get_futures_ticker(
    symbol: web::Path<String>,
    state: web::Data<AppState>,
) -> impl Responder {
    let pairs = state.trading_pairs.lock().unwrap();
    
    if let Some(pair) = pairs.get(&*symbol) {
        let ticker = Ticker {
            symbol: pair.symbol.clone(),
            price: pair.price,
            change_24h: pair.change_24h,
            volume_24h: pair.volume_24h,
            high_24h: pair.high_24h,
            low_24h: pair.low_24h,
            timestamp: chrono::Utc::now().timestamp(),
        };
        HttpResponse::Ok().json(ticker)
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "Symbol not found"}))
    }
}

// 下合约订单
pub async fn place_futures_order(
    req: actix_web::HttpRequest,
    state: web::Data<AppState>,
    order_req: web::Json<PlaceFuturesOrderRequest>,
) -> impl Responder {
    let user_id = req.headers()
        .get("X-User-ID")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "default".to_string());
    
    let order = FuturesOrder::new(
        user_id.clone(),
        order_req.symbol.clone(),
        order_req.side.clone(),
        order_req.order_type.clone(),
        order_req.size,
        order_req.price,
        order_req.leverage.unwrap_or(10),
    );
    
    let order_response = order.clone();
    
    let mut futures_orders = state.futures_orders.lock().unwrap();
    let user_orders = futures_orders.entry(user_id.clone()).or_default();
    user_orders.push(order);
    
    HttpResponse::Ok().json(serde_json::json!({
        "order": order_response
    }))
}

// 获取持仓
pub async fn get_futures_positions(
    req: actix_web::HttpRequest,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = req.headers()
        .get("X-User-ID")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "default".to_string());
    
    let positions = state.positions.lock().unwrap();
    let user_positions = positions.get(&user_id).cloned().unwrap_or_default();
    
    HttpResponse::Ok().json(user_positions)
}

// 获取持仓详情
pub async fn get_futures_position_detail(
    position_id: web::Path<String>,
    state: web::Data<AppState>,
) -> impl Responder {
    let positions = state.positions.lock().unwrap();
    
    for user_positions in positions.values() {
        for pos in user_positions {
            if pos.id == *position_id {
                return HttpResponse::Ok().json(pos);
            }
        }
    }
    
    HttpResponse::NotFound().json(serde_json::json!({"error": "Position not found"}))
}

// 获取合约订单
pub async fn get_futures_orders(
    req: actix_web::HttpRequest,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = req.headers()
        .get("X-User-ID")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "default".to_string());
    
    let futures_orders = state.futures_orders.lock().unwrap();
    let user_orders = futures_orders.get(&user_id).cloned().unwrap_or_default();
    
    HttpResponse::Ok().json(user_orders)
}

// 平仓
pub async fn close_futures_position(
    _position_id: web::Path<String>,
    _state: web::Data<AppState>,
) -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "message": "Position closed"
    }))
}

// ============ Earn Handlers ============

// 获取理财产品
pub async fn get_earn_products(state: web::Data<AppState>) -> impl Responder {
    let products = state.earn_products.lock().unwrap();
    HttpResponse::Ok().json(products.clone())
}

// 订阅理财产品
pub async fn subscribe_earn(
    req: actix_web::HttpRequest,
    state: web::Data<AppState>,
    subscribe_req: web::Json<SubscribeEarnRequest>,
) -> impl Responder {
    let user_id = req.headers()
        .get("X-User-ID")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "default".to_string());
    
    let products = state.earn_products.lock().unwrap();
    let product = products.iter().find(|p| p.id == subscribe_req.product_id);
    
    if product.is_none() {
        return HttpResponse::NotFound().json(serde_json::json!({"error": "Product not found"}));
    }
    
    let product = product.unwrap();
    
    if subscribe_req.amount < product.min_amount {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Amount below minimum"
        }));
    }
    
    let subscription = EarnSubscription::new(
        user_id.clone(),
        subscribe_req.product_id.clone(),
        subscribe_req.amount,
        product.lock_period,
    );
    
    let subscription_response = subscription.clone();
    
    let mut subscriptions = state.earn_subscriptions.lock().unwrap();
    let user_subs = subscriptions.entry(user_id.clone()).or_default();
    user_subs.push(subscription);
    
    HttpResponse::Ok().json(serde_json::json!({
        "subscription": subscription_response
    }))
}

// 获取持仓
pub async fn get_earn_holdings(
    req: actix_web::HttpRequest,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = req.headers()
        .get("X-User-ID")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "default".to_string());
    
    let subscriptions = state.earn_subscriptions.lock().unwrap();
    let user_subs = subscriptions.get(&user_id).cloned().unwrap_or_default();
    
    HttpResponse::Ok().json(user_subs)
}

// ============ Buy Crypto Handlers ============

// 获取法币价格
pub async fn get_fiat_price(
    query: web::Query<std::collections::HashMap<String, String>>,
) -> impl Responder {
    let fiat = query.get("fiat").cloned().unwrap_or_else(|| "CNY".to_string());
    let crypto = query.get("crypto").cloned().unwrap_or_else(|| "USDT".to_string());
    
    let price = match (fiat.as_str(), crypto.as_str()) {
        ("CNY", "USDT") => 7.25,
        ("CNY", "BTC") => 7.25 * 65432.50,
        ("USD", "USDT") => 1.0,
        ("USD", "BTC") => 65432.50,
        _ => 1.0,
    };
    
    HttpResponse::Ok().json(FiatPrice {
        fiat_currency: fiat,
        crypto_currency: crypto,
        price,
        limit_min: 100.0,
        limit_max: 50000.0,
    })
}

// 获取支付方式
pub async fn get_payment_methods() -> impl Responder {
    let methods = vec![
        PaymentMethod {
            id: "bank_transfer".to_string(),
            name: "银行转账".to_string(),
            method_type: "bank".to_string(),
        },
        PaymentMethod {
            id: "alipay".to_string(),
            name: "支付宝".to_string(),
            method_type: "wallet".to_string(),
        },
        PaymentMethod {
            id: "wechat".to_string(),
            name: "微信支付".to_string(),
            method_type: "wallet".to_string(),
        },
    ];
    
    HttpResponse::Ok().json(methods)
}

// 创建买币订单
pub async fn create_buy_order(
    req: actix_web::HttpRequest,
    _state: web::Data<AppState>,
    order_req: web::Json<CreateBuyOrderRequest>,
) -> impl Responder {
    let user_id = req.headers()
        .get("X-User-ID")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "default".to_string());
    
    let result = serde_json::json!({
        "order_id": uuid::Uuid::new_v4().to_string(),
        "user_id": user_id,
        "fiat_currency": order_req.fiat_currency,
        "crypto_currency": order_req.crypto_currency,
        "amount": order_req.amount,
        "payment_method_id": order_req.payment_method_id,
        "status": "pending",
        "created_at": chrono::Utc::now().timestamp()
    });
    
    HttpResponse::Ok().json(result)
}

// 获取买币订单
pub async fn get_buy_orders(
    _req: actix_web::HttpRequest,
    _state: web::Data<AppState>,
) -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "orders": []
    }))
}
