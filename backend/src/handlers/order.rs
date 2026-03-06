// Handlers - Order Handlers
use actix_web::{web, HttpResponse, Responder};
use crate::application::dtos::*;
use crate::domain::*;
use crate::infrastructure::AppState;

// 下单
pub async fn place_order(
    req: actix_web::HttpRequest,
    state: web::Data<AppState>,
    order_req: web::Json<PlaceOrderRequest>,
) -> impl Responder {
    let user_id = req.headers()
        .get("X-User-ID")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "default".to_string());
    
    let order = Order::new(
        user_id,
        order_req.symbol.clone(),
        order_req.side.clone(),
        order_req.order_type.clone(),
        order_req.price,
        order_req.quantity,
    );
    
    let order_response = order.clone();
    
    let mut orders = state.orders.lock().unwrap();
    orders.insert(order.id.clone(), order);
    
    HttpResponse::Ok().json(serde_json::json!({
        "order": order_response
    }))
}

// 获取订单列表
pub async fn get_orders(
    req: actix_web::HttpRequest,
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = req.headers()
        .get("X-User-ID")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "default".to_string());
    
    let orders = state.orders.lock().unwrap();
    let result: Vec<&Order> = orders.values()
        .filter(|o| o.user_id == user_id)
        .collect();
    
    HttpResponse::Ok().json(result)
}

// 取消订单
pub async fn cancel_order(
    order_id: web::Path<String>,
    state: web::Data<AppState>,
) -> impl Responder {
    let mut orders = state.orders.lock().unwrap();
    
    if let Some(order) = orders.get_mut(&*order_id) {
        order.status = "cancelled".to_string();
        HttpResponse::Ok().json(serde_json::json!({
            "message": "Order cancelled"
        }))
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "Order not found"}))
    }
}

// 获取订单详情
pub async fn get_order_detail(
    order_id: web::Path<String>,
    state: web::Data<AppState>,
) -> impl Responder {
    let orders = state.orders.lock().unwrap();
    
    if let Some(order) = orders.get(&*order_id) {
        HttpResponse::Ok().json(order)
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "Order not found"}))
    }
}

// 获取成交记录
pub async fn get_trades(
    req: actix_web::HttpRequest,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = req.headers()
        .get("X-User-ID")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "default".to_string());
    
    let trades = state.trades.lock().unwrap();
    let result: Vec<&Trade> = trades.values()
        .filter(|t| t.user_id == user_id)
        .collect();
    
    HttpResponse::Ok().json(result)
}

// 检查止损单
pub async fn check_stop_orders(
    state: web::Data<AppState>,
) -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "triggered": []
    }))
}
