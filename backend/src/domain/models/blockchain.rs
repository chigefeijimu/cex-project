// Blockchain 模块 - BSC 测试链集成
#![allow(dead_code)]

use serde::{Deserialize, Serialize};

/// BSC 测试链配置
#[derive(Debug, Clone)]
pub struct BlockchainConfig {
    pub rpc_url: String,
    pub chain_id: u64,
    pub network: String,
}

impl Default for BlockchainConfig {
    fn default() -> Self {
        Self {
            rpc_url: "https://bnb-testnet.g.alchemy.com/v2/1Vn7ZDG5ErTLKPWoR3JzmwrrCsq4EilA".to_string(),
            chain_id: 97, // BSC Testnet Chain ID
            network: "bsc-testnet".to_string(),
        }
    }
}

/// 区块链服务
pub struct BlockchainService {
    config: BlockchainConfig,
    http_client: reqwest::Client,
}

impl BlockchainService {
    pub fn new(config: BlockchainConfig) -> Self {
        Self {
            config,
            http_client: reqwest::Client::new(),
        }
    }

    /// 获取用户充值地址 (从私钥派生)
    pub fn derive_address(&self, user_id: &str) -> String {
        // 简化实现：基于用户 ID 生成确定地址
        // 实际生产应使用 HD Wallet
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};
        
        let mut hasher = DefaultHasher::new();
        user_id.hash(&mut hasher);
        let hash = hasher.finish();
        
        // 格式化为 BSC 地址格式 (0x 开头 + 40 字符 hex)
        let addr = format!("{:040x}", hash);
        format!("0x{}", &addr[..40])
    }

    /// 获取余额
    pub async fn get_balance(&self, address: &str) -> Result<f64, String> {
        let params = serde_json::json!([
            {
                "jsonrpc": "2.0",
                "method": "eth_getBalance",
                "params": [address, "latest"],
                "id": 1
            }
        ]);

        let response = self.http_client
            .post(&self.config.rpc_url)
            .json(&params)
            .send()
            .await
            .map_err(|e| e.to_string())?
            .json::<serde_json::Value>()
            .await
            .map_err(|e| e.to_string())?;

        if let Some(result) = response.get("result") {
            let hex_balance = result.as_str().unwrap_or("0x0");
            let balance = hex::decode(&hex_balance[2..]).unwrap_or_default();
            let balance_u64 = u64::from_be_bytes(
                balance.as_slice().try_into().unwrap_or([0u8; 8])
            );
            // 转换为 BNB (18 位小数)
            Ok(balance_u64 as f64 / 1e18)
        } else {
            Ok(0.0)
        }
    }

    /// 获取 Token 余额 (BEP-20)
    pub async fn get_token_balance(&self, address: &str, token_address: &str) -> Result<f64, String> {
        // BEP-20 balanceOf 方法签名
        let data = format!(
            "0x70a08231000000000000000000000000{}",
            &address[2..] // 去掉 0x 前缀
        );

        let params = serde_json::json!([
            {
                "jsonrpc": "2.0",
                "method": "eth_call",
                "params": [{
                    "to": token_address,
                    "data": data
                }, "latest"],
                "id": 1
            }
        ]);

        let response = self.http_client
            .post(&self.config.rpc_url)
            .json(&params)
            .send()
            .await
            .map_err(|e| e.to_string())?
            .json::<serde_json::Value>()
            .await
            .map_err(|e| e.to_string())?;

        if let Some(result) = response.get("result") {
            let hex_balance = result.as_str().unwrap_or("0x0");
            let balance = hex::decode(&hex_balance[2..]).unwrap_or_default();
            let balance_u256 = u128::from_be_bytes(
                balance.as_slice().try_into().unwrap_or([0u8; 16])
            );
            // 返回原始精度，实际需根据 Token 精度转换
            Ok(balance_u256 as f64)
        } else {
            Ok(0.0)
        }
    }

    /// 广播交易 (提现用)
    pub async fn broadcast_transaction(&self, signed_tx: &str) -> Result<String, String> {
        let params = serde_json::json!([
            {
                "jsonrpc": "2.0",
                "method": "eth_sendRawTransaction",
                "params": [signed_tx],
                "id": 1
            }
        ]);

        let response = self.http_client
            .post(&self.config.rpc_url)
            .json(&params)
            .send()
            .await
            .map_err(|e| e.to_string())?
            .json::<serde_json::Value>()
            .await
            .map_err(|e| e.to_string())?;

        if let Some(result) = response.get("result") {
            Ok(result.as_str().unwrap_or("").to_string())
        } else if let Some(error) = response.get("error") {
            Err(error.to_string())
        } else {
            Err("Unknown error".to_string())
        }
    }

    /// 获取交易状态
    pub async fn get_transaction_receipt(&self, tx_hash: &str) -> Result<TransactionReceipt, String> {
        let params = serde_json::json!([
            {
                "jsonrpc": "2.0",
                "method": "eth_getTransactionReceipt",
                "params": [tx_hash],
                "id": 1
            }
        ]);

        let response = self.http_client
            .post(&self.config.rpc_url)
            .json(&params)
            .send()
            .await
            .map_err(|e| e.to_string())?
            .json::<serde_json::Value>()
            .await
            .map_err(|e| e.to_string())?;

        if let Some(result) = response.get("result").and_then(|r| r.as_object()) {
            let status = result.get("status")
                .and_then(|s| s.as_str())
                .map(|s| s == "0x1")
                .unwrap_or(false);
            
            let confirmations = result.get("confirmations")
                .and_then(|c| c.as_str())
                .and_then(|c| u64::from_str_radix(c.trim_start_matches("0x"), 16).ok())
                .unwrap_or(0);

            Ok(TransactionReceipt {
                tx_hash: tx_hash.to_string(),
                status,
                confirmations,
                block_number: result.get("blockNumber")
                    .and_then(|b| b.as_str())
                    .map(|b| u64::from_str_radix(b.trim_start_matches("0x"), 16).unwrap_or(0))
                    .unwrap_or(0),
            })
        } else {
            Err("Transaction not found".to_string())
        }
    }
}

/// 交易回执
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionReceipt {
    pub tx_hash: String,
    pub status: bool,
    pub confirmations: u64,
    pub block_number: u64,
}

/// 充值记录
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DepositRecord {
    pub id: String,
    pub user_id: String,
    pub currency: String,
    pub amount: f64,
    pub from_address: String,
    pub to_address: String,
    pub tx_hash: String,
    pub status: String, // pending, confirmed, failed
    pub confirmations: u64,
    pub created_at: i64,
}

/// 提现记录
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WithdrawRecord {
    pub id: String,
    pub user_id: String,
    pub currency: String,
    pub amount: f64,
    pub to_address: String,
    pub tx_hash: Option<String>,
    pub status: String, // pending, processing, confirmed, failed
    pub created_at: i64,
}
