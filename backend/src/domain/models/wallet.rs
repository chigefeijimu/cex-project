// Domain Models - 钱包和资产模型
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WalletBalance {
    pub currency: String,
    pub available: f64,
    pub frozen: f64,
    pub total: f64,
}

impl WalletBalance {
    #[allow(dead_code)]
    pub fn new(currency: String) -> Self {
        Self {
            currency,
            available: 0.0,
            frozen: 0.0,
            total: 0.0,
        }
    }

    #[allow(dead_code)]
    pub fn add_available(&mut self, amount: f64) {
        self.available += amount;
        self.total += amount;
    }

    #[allow(dead_code)]
    pub fn freeze(&mut self, amount: f64) -> bool {
        if self.available >= amount {
            self.available -= amount;
            self.frozen += amount;
            true
        } else {
            false
        }
    }

    #[allow(dead_code)]
    pub fn unfreeze(&mut self, amount: f64) {
        self.frozen = (self.frozen - amount).max(0.0);
        self.available += amount;
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: String,
    pub user_id: String,
    pub tx_type: String, // deposit, withdraw, transfer
    pub currency: String,
    pub amount: f64,
    pub fee: f64,
    pub status: String, // pending, confirmed, failed
    pub address: Option<String>,
    pub tx_hash: Option<String>,
    pub created_at: i64,
    pub confirmations: Option<i32>,
}

impl Transaction {
    #[allow(dead_code)]
    pub fn new(
        user_id: String,
        tx_type: String,
        currency: String,
        amount: f64,
    ) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            user_id,
            tx_type,
            currency,
            amount,
            fee: 0.0,
            status: "pending".to_string(),
            address: None,
            tx_hash: None,
            created_at: chrono::Utc::now().timestamp(),
            confirmations: None,
        }
    }
}

// 充值地址
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DepositAddress {
    pub currency: String,
    pub address: String,
    pub tag: Option<String>,
    pub network: String,
}

// 提现白名单
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WithdrawAddress {
    pub id: String,
    pub user_id: String,
    pub currency: String,
    pub address: String,
    pub tag: Option<String>,
    pub network: String,
    pub label: String,
    pub created_at: i64,
}

impl WithdrawAddress {
    #[allow(dead_code)]
    pub fn new(
        user_id: String,
        currency: String,
        address: String,
        network: String,
        label: String,
    ) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            user_id,
            currency,
            address,
            tag: None,
            network,
            label,
            created_at: chrono::Utc::now().timestamp(),
        }
    }
}
