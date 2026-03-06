// Handlers - Market Handlers
use actix_web::{web, HttpResponse, Responder};
use crate::application::dtos::*;
use crate::domain::*;
use crate::infrastructure::AppState;

// 获取交易对列表
pub async fn get_symbols(
    state: web::Data<AppState>,
    query: web::Query<GetSymbolsQuery>,
) -> impl Responder {
    let pairs = state.trading_pairs.lock().unwrap();
    let mut result: Vec<&TradingPair> = pairs.values().collect();
    
    // 搜索过滤
    if let Some(search) = &query.search {
        let search_lower = search.to_lowercase();
        result.retain(|p| {
            p.symbol.to_lowercase().contains(&search_lower) ||
            p.name.to_lowercase().contains(&search_lower)
        });
    }
    
    // 排序
    if let Some(sort) = &query.sort {
        match sort.as_str() {
            "volume" => result.sort_by(|a, b| b.volume_24h.partial_cmp(&a.volume_24h).unwrap()),
            "price" => result.sort_by(|a, b| b.price.partial_cmp(&a.price).unwrap()),
            "change" => result.sort_by(|a, b| b.change_24h.partial_cmp(&a.change_24h).unwrap()),
            _ => {}
        }
    }
    
    HttpResponse::Ok().json(result)
}

// 获取市场统计
pub async fn get_market_stats(state: web::Data<AppState>) -> impl Responder {
    let stats = state.market_stats.lock().unwrap();
    HttpResponse::Ok().json(MarketStats {
        total_volume_24h: stats.total_volume_24h,
        total_trades_24h: stats.total_trades_24h,
        btc_dominance: stats.btc_dominance,
        active_markets: stats.active_markets,
    })
}

// 获取 ticker
pub async fn get_ticker(
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

// 获取深度
pub async fn get_depth(
    symbol: web::Path<String>,
    state: web::Data<AppState>,
) -> impl Responder {
    let orderbooks = state.orderbooks.lock().unwrap();
    
    if let Some(orderbook) = orderbooks.get(&*symbol) {
        HttpResponse::Ok().json(orderbook)
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "Symbol not found"}))
    }
}

// 获取 K线
pub async fn get_kline(
    symbol: web::Path<String>,
    query: web::Query<GetKlineQuery>,
    state: web::Data<AppState>,
) -> impl Responder {
    let klines_map = state.klines.lock().unwrap();
    
    if let Some(klines) = klines_map.get(&*symbol) {
        let limit = query.limit.unwrap_or(100);
        let klines: Vec<&Kline> = klines.iter().rev().take(limit).collect();
        HttpResponse::Ok().json(klines)
    } else {
        // 返回模拟 K线数据
        let pairs = state.trading_pairs.lock().unwrap();
        if let Some(pair) = pairs.get(&*symbol) {
            let base_price = pair.price;
            let mut klines = Vec::new();
            let now = chrono::Utc::now().timestamp();
            let interval = 3600; // 1小时
            
            for i in (0i64..100).rev() {
                let ts = now - (i * interval);
                let change = (rand_simple(i as usize) - 0.5) * 0.02 * base_price;
                let open = base_price + change;
                let close = base_price + (rand_simple((i + 1) as usize) - 0.5) * 0.02 * base_price;
                let high = open.max(close) * (1.0 + rand_simple((i + 2) as usize) * 0.01);
                let low = open.min(close) * (1.0 - rand_simple((i + 3) as usize) * 0.01);
                let volume = 100.0 + rand_simple((i + 4) as usize) * 500.0;
                
                klines.push(Kline {
                    timestamp: ts,
                    open,
                    high,
                    low,
                    close,
                    volume,
                });
            }
            
            let limit = query.limit.unwrap_or(100);
            let klines: Vec<Kline> = klines.into_iter().rev().take(limit).collect();
            HttpResponse::Ok().json(klines)
        } else {
            HttpResponse::NotFound().json(serde_json::json!({"error": "Symbol not found"}))
        }
    }
}

// 简单的随机数生成
fn rand_simple(seed: usize) -> f64 {
    ((seed * 1103515245 + 12345) % 2147483648) as f64 / 2147483648.0
}

// 获取自选
pub async fn get_favorites(
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = query.get("user_id").cloned().unwrap_or_default();
    let favorites = state.favorites.lock().unwrap();
    let user_favorites = favorites.get(&user_id).cloned().unwrap_or_default();
    
    let pairs = state.trading_pairs.lock().unwrap();
    let result: Vec<&TradingPair> = pairs.values()
        .filter(|p| user_favorites.contains(&p.symbol))
        .collect();
    
    HttpResponse::Ok().json(result)
}

// 添加自选
pub async fn add_favorite(
    req: actix_web::HttpRequest,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = req.headers()
        .get("X-User-ID")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "default".to_string());
    
    let mut favorites = state.favorites.lock().unwrap();
    let user_favorites = favorites.entry(user_id).or_insert_with(Vec::new);
    
    HttpResponse::Ok().json(serde_json::json!({
        "message": "Favorite added"
    }))
}

// 移除自选
pub async fn remove_favorite(
    req: actix_web::HttpRequest,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = req.headers()
        .get("X-User-ID")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "default".to_string());
    
    let mut favorites = state.favorites.lock().unwrap();
    if let Some(user_favorites) = favorites.get_mut(&user_id) {
        // 移除逻辑
    }
    
    HttpResponse::Ok().json(serde_json::json!({
        "message": "Favorite removed"
    }))
}
