// Domain Models - 交易对和市场模型
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TradingPair {
    pub id: String,
    pub base: String,
    pub quote: String,
    pub symbol: String,
    pub name: String,
    pub price: f64,
    pub change_24h: f64,
    pub volume_24h: f64,
    pub high_24h: f64,
    pub low_24h: f64,
    pub market_cap: f64,
}

impl TradingPair {
    pub fn new(base: String, quote: String, name: String) -> Self {
        let symbol = format!("{}/{}", base, quote);
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            base: base.clone(),
            quote,
            symbol: symbol.clone(),
            name,
            price: 0.0,
            change_24h: 0.0,
            volume_24h: 0.0,
            high_24h: 0.0,
            low_24h: 0.0,
            market_cap: 0.0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Ticker {
    pub symbol: String,
    pub price: f64,
    pub change_24h: f64,
    pub volume_24h: f64,
    pub high_24h: f64,
    pub low_24h: f64,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderBookEntry {
    pub price: f64,
    pub quantity: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderBook {
    pub symbol: String,
    pub bids: Vec<OrderBookEntry>,
    pub asks: Vec<OrderBookEntry>,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Kline {
    pub timestamp: i64,
    pub open: f64,
    pub high: f64,
    pub low: f64,
    pub close: f64,
    pub volume: f64,
}

// 市场统计
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketStats {
    pub total_volume_24h: f64,
    pub total_trades_24h: i64,
    pub btc_dominance: f64,
    pub active_markets: i32,
}

// K线时间间隔
#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub enum KlineInterval {
    OneMinute,
    FiveMinutes,
    FifteenMinutes,
    OneHour,
    FourHours,
    OneDay,
    OneWeek,
}

impl KlineInterval {
    #[allow(dead_code)]
    pub fn as_str(&self) -> &str {
        match self {
            KlineInterval::OneMinute => "1m",
            KlineInterval::FiveMinutes => "5m",
            KlineInterval::FifteenMinutes => "15m",
            KlineInterval::OneHour => "1h",
            KlineInterval::FourHours => "4h",
            KlineInterval::OneDay => "1d",
            KlineInterval::OneWeek => "1w",
        }
    }
}
