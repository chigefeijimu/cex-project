// CEX Backend Server - Main Entry Point
// 使用 DDD 领域驱动设计架构

mod domain;
mod application;
mod infrastructure;
mod handlers;

use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use infrastructure::AppState;
use handlers::*;

// 健康检查
async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "ok",
        "timestamp": chrono::Utc::now().timestamp()
    }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // 初始化日志
    tracing_subscriber::fmt::init();
    
    let bind = "0.0.0.0:8080";
    println!("Starting CEX Server on http://{}", bind);
    
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(AppState::default()))
            
            // 健康检查
            .route("/health", web::get().to(health_check))
            
            // 认证相关
            .route("/api/v1/auth/register", web::post().to(register))
            .route("/api/v1/auth/login", web::post().to(login))
            .route("/api/v1/auth/logout", web::post().to(logout))
            
            // 推荐计划
            .route("/api/v1/referral/code", web::get().to(get_invite_code))
            .route("/api/v1/referral/stats", web::get().to(get_referral_stats))
            .route("/api/v1/referral/list", web::get().to(get_referral_list))
            
            // 用户
            .route("/api/v1/user/profile", web::get().to(get_profile))
            .route("/api/v1/user/profile", web::put().to(update_profile))
            
            // 市场数据
            .route("/api/v1/market/symbols", web::get().to(get_symbols))
            .route("/api/v1/market/stats", web::get().to(get_market_stats))
            .route("/api/v1/market/ticker/{symbol}", web::get().to(get_ticker))
            .route("/api/v1/market/depth/{symbol}", web::get().to(get_depth))
            .route("/api/v1/market/kline/{symbol}", web::get().to(get_kline))
            .route("/api/v1/market/favorites", web::get().to(get_favorites))
            .route("/api/v1/market/favorites/add", web::post().to(add_favorite))
            .route("/api/v1/market/favorites/remove", web::post().to(remove_favorite))
            
            // 现货订单
            .route("/api/v1/order/place", web::post().to(place_order))
            .route("/api/v1/order/list", web::get().to(get_orders))
            .route("/api/v1/order/cancel/{order_id}", web::delete().to(cancel_order))
            .route("/api/v1/order/{order_id}", web::get().to(get_order_detail))
            .route("/api/v1/order/trades", web::get().to(get_trades))
            .route("/api/v1/order/check-stop", web::post().to(check_stop_orders))
            
            // 钱包
            .route("/api/v1/wallet/balance/{user_id}", web::get().to(get_balance))
            .route("/api/v1/wallet/deposit/address", web::post().to(get_deposit_address))
            .route("/api/v1/wallet/withdraw", web::post().to(withdraw))
            .route("/api/v1/wallet/transfer", web::post().to(transfer))
            .route("/api/v1/wallet/transactions", web::get().to(get_transactions))
            .route("/api/v1/wallet/whitelist/add", web::post().to(add_withdraw_whitelist))
            .route("/api/v1/wallet/whitelist", web::get().to(get_withdraw_whitelist))
            .route("/api/v1/wallet/whitelist/{address_id}", web::delete().to(remove_from_whitelist))
            
            // 合约
            .route("/api/v1/futures/symbols", web::get().to(get_futures_symbols))
            .route("/api/v1/futures/ticker/{symbol}", web::get().to(get_futures_ticker))
            .route("/api/v1/futures/order", web::post().to(place_futures_order))
            .route("/api/v1/futures/positions", web::get().to(get_futures_positions))
            .route("/api/v1/futures/position/{position_id}", web::get().to(get_futures_position_detail))
            .route("/api/v1/futures/orders", web::get().to(get_futures_orders))
            .route("/api/v1/futures/position/{position_id}", web::delete().to(close_futures_position))
            
            // 理财
            .route("/api/v1/earn/products", web::get().to(get_earn_products))
            .route("/api/v1/earn/subscribe", web::post().to(subscribe_earn))
            .route("/api/v1/earn/holdings", web::get().to(get_earn_holdings))
            
            // 买币
            .route("/api/v1/buy/fiat-price", web::get().to(get_fiat_price))
            .route("/api/v1/buy/payment-methods", web::get().to(get_payment_methods))
            .route("/api/v1/buy/create-order", web::post().to(create_buy_order))
            .route("/api/v1/buy/orders", web::get().to(get_buy_orders))
            
            // 根路径
            .route("/", web::get().to(|| async { "CEX API Server Running - DDD Architecture" }))
    })
    .bind(bind)?
    .run()
    .await
}
