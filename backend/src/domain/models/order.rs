// Domain Models - 订单和交易模型
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Order {
    pub id: String,
    pub user_id: String,
    pub symbol: String,
    pub side: String,      // buy or sell
    pub order_type: String, // limit or market
    pub price: f64,
    pub quantity: f64,
    pub filled: f64,
    pub status: String,    // pending, partially_filled, filled, cancelled
    pub stop_price: Option<f64>,
    pub order_trigger: Option<String>, // stop_loss, take_profit
    pub created_at: i64,
    pub updated_at: i64,
}

impl Order {
    pub fn new(
        user_id: String,
        symbol: String,
        side: String,
        order_type: String,
        price: f64,
        quantity: f64,
    ) -> Self {
        let now = chrono::Utc::now().timestamp();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            user_id,
            symbol,
            side,
            order_type,
            price,
            quantity,
            filled: 0.0,
            status: "pending".to_string(),
            stop_price: None,
            order_trigger: None,
            created_at: now,
            updated_at: now,
        }
    }

    #[allow(dead_code)]
    pub fn is_filled(&self) -> bool {
        self.status == "filled" || self.filled >= self.quantity
    }

    #[allow(dead_code)]
    pub fn is_cancelled(&self) -> bool {
        self.status == "cancelled"
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Trade {
    pub id: String,
    pub order_id: String,
    pub user_id: String,
    pub symbol: String,
    pub side: String,
    pub price: f64,
    pub quantity: f64,
    pub fee: f64,
    pub fee_currency: String,
    pub created_at: i64,
}

impl Trade {
    #[allow(dead_code)]
    pub fn new(
        order_id: String,
        user_id: String,
        symbol: String,
        side: String,
        price: f64,
        quantity: f64,
        fee: f64,
        fee_currency: String,
    ) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            order_id,
            user_id,
            symbol,
            side,
            price,
            quantity,
            fee,
            fee_currency,
            created_at: chrono::Utc::now().timestamp(),
        }
    }
}

// 订单类型
#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub enum OrderSide {
    Buy,
    Sell,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub enum OrderType {
    Limit,
    Market,
    StopLoss,
    StopProfit,
}
