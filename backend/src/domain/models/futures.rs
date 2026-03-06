// Domain Models - 合约和理财模型
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FuturesContract {
    pub symbol: String,
    pub name: String,
    pub price: f64,
    pub change_24h: f64,
    pub volume_24h: f64,
    pub funding_rate: f64,
    pub next_funding_time: i64,
    pub leverage: String,
    pub contract_type: String, // perpetual, delivery
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FuturesPosition {
    pub id: String,
    pub user_id: String,
    pub symbol: String,
    pub side: String, // long or short
    pub size: f64,
    pub entry_price: f64,
    pub leverage: i32,
    pub margin: f64,
    pub unrealized_pnl: f64,
    pub liquidation_price: Option<f64>,
    pub open_time: i64,
    pub status: String, // open, closed, liquidated
}

impl FuturesPosition {
    #[allow(dead_code)]
    pub fn new(
        user_id: String,
        symbol: String,
        side: String,
        size: f64,
        entry_price: f64,
        leverage: i32,
        margin: f64,
    ) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            user_id,
            symbol,
            side,
            size,
            entry_price,
            leverage,
            margin,
            unrealized_pnl: 0.0,
            liquidation_price: None,
            open_time: chrono::Utc::now().timestamp(),
            status: "open".to_string(),
        }
    }

    #[allow(dead_code)]
    pub fn calculate_pnl(&self, current_price: f64) -> f64 {
        let price_diff = match self.side.as_str() {
            "long" => current_price - self.entry_price,
            "short" => self.entry_price - current_price,
            _ => 0.0,
        };
        price_diff * self.size
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FuturesOrder {
    pub id: String,
    pub user_id: String,
    pub symbol: String,
    pub side: String,
    pub order_type: String,
    pub size: f64,
    pub price: Option<f64>,
    pub leverage: i32,
    pub filled: f64,
    pub status: String,
    pub created_at: i64,
}

impl FuturesOrder {
    pub fn new(
        user_id: String,
        symbol: String,
        side: String,
        order_type: String,
        size: f64,
        price: Option<f64>,
        leverage: i32,
    ) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            user_id,
            symbol,
            side,
            order_type,
            size,
            price,
            leverage,
            filled: 0.0,
            status: "pending".to_string(),
            created_at: chrono::Utc::now().timestamp(),
        }
    }
}

// 理财相关模型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EarnProduct {
    pub id: String,
    pub name: String,
    pub currency: String,
    pub apy: f64,           // 年化收益率
    pub min_amount: f64,    // 最小投资金额
    pub lock_period: i64,   // 锁定期(秒)
    pub status: String,     // active, paused, ended
}

impl EarnProduct {
    pub fn new(name: String, currency: String, apy: f64, min_amount: f64, lock_period: i64) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            currency,
            apy,
            min_amount,
            lock_period,
            status: "active".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EarnSubscription {
    pub id: String,
    pub user_id: String,
    pub product_id: String,
    pub amount: f64,
    pub start_time: i64,
    pub end_time: i64,
    pub status: String, // active, completed, redeemed
    pub earned: f64,
}

impl EarnSubscription {
    pub fn new(user_id: String, product_id: String, amount: f64, lock_period: i64) -> Self {
        let now = chrono::Utc::now().timestamp();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            user_id,
            product_id,
            amount,
            start_time: now,
            end_time: now + lock_period,
            status: "active".to_string(),
            earned: 0.0,
        }
    }
}
