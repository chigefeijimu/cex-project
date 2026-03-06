use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::collections::HashMap;
use chrono::Utc;
use uuid::Uuid;
use bcrypt::{hash, verify, DEFAULT_COST};

// ============ Models ============

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub email: String,
    pub username: String,
    pub password_hash: String,
    pub created_at: i64,
    pub kyc_status: String,
    pub kyc_level: i32,  // 0: 未认证, 1: 基础认证, 2: 高级认证
    pub two_factor_enabled: bool,
    pub two_factor_secret: Option<String>,
}

// ============ KYC Models ============

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KycSubmission {
    pub first_name: String,
    pub last_name: String,
    pub country: String,
    pub id_type: String,  // passport, national_id, driver_license
    pub id_number: String,
    pub document_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KycStatus {
    pub status: String,  // none, pending, approved, rejected
    pub level: i32,
    pub submitted_at: Option<i64>,
    pub reviewed_at: Option<i64>,
    pub rejection_reason: Option<String>,
}

// ============ Withdraw Whitelist ============

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WithdrawAddress {
    pub id: String,
    pub currency: String,
    pub address: String,
    pub tag: Option<String>,
    pub network: String,
    pub label: String,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TradingPair {
    pub id: String,
    pub base: String,
    pub quote: String,
    pub symbol: String,
    pub name: String,  // 币种名称 (e.g., "Bitcoin")
    pub price: f64,
    pub change_24h: f64,
    pub volume_24h: f64,
    pub high_24h: f64,
    pub low_24h: f64,
    pub market_cap: f64,  // 市值
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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WalletBalance {
    pub currency: String,
    pub available: f64,
    pub frozen: f64,
    pub total: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Order {
    pub id: String,
    pub symbol: String,
    pub side: String,
    pub order_type: String,
    pub price: f64,
    pub quantity: f64,
    pub filled: f64,
    pub status: String,
    pub stop_price: Option<f64>,  // 止损止盈触发价格
    pub order_trigger: Option<String>,  // trigger: 触发类型 (stop_loss, take_profit)
    pub created_at: i64,
}

// ============ Trade/成交记录 ============

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Trade {
    pub id: String,
    pub order_id: String,
    pub symbol: String,
    pub side: String,
    pub price: f64,
    pub quantity: f64,
    pub fee: f64,
    pub fee_currency: String,
    pub created_at: i64,
}

// ============ Transaction History ============

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: String,
    pub tx_type: String,
    pub currency: String,
    pub amount: f64,
    pub fee: f64,
    pub status: String,
    pub address: Option<String>,
    pub tx_hash: Option<String>,
    pub created_at: i64,
    pub confirmations: Option<i32>,
}

// ============ Futures Models ============

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
    pub contract_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FuturesPosition {
    pub id: String,
    pub symbol: String,
    pub side: String, // "long" or "short"
    pub size: f64,
    pub entry_price: f64,
    pub leverage: i32,
    pub margin: f64,
    pub unrealized_pnl: f64,
    pub liquidation_price: Option<f64>,
    pub open_time: i64,
    pub status: String, // "open" or "closed"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FuturesOrderRequest {
    pub symbol: String,
    pub side: String, // "buy" or "sell"
    pub order_type: String, // "limit" or "market"
    pub size: f64, // 合约数量
    pub price: Option<f64>, // 限价单价格
    pub leverage: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FuturesOrder {
    pub id: String,
    pub symbol: String,
    pub side: String,
    pub order_type: String,
    pub size: f64,
    pub price: f64,
    pub filled: f64,
    pub status: String,
    pub leverage: i32,
    pub created_at: i64,
}

// ============ Earn/理财 Models ============

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EarnProduct {
    pub id: String,
    pub symbol: String,
    pub name: String,
    pub apr: f64,
    pub duration: String,
    pub product_type: String,
    pub min_amount: f64,
    pub max_amount: Option<f64>,
    pub tag: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EarnSubscription {
    pub id: String,
    pub product_id: String,
    pub symbol: String,
    pub amount: f64,
    pub apr: f64,
    pub start_time: i64,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DepositAddress {
    pub currency: String,
    pub address: String,
    pub tag: Option<String>,
    pub network: String,
}

// ============ BuyCrypto/Fiat On-Ramp Models ============

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FiatPrice {
    pub crypto: String,
    pub fiat: String,
    pub crypto_price: f64,
    pub fiat_price: f64,
    pub min_amount: f64,
    pub max_amount: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuyCryptoRequest {
    pub spend_currency: String,
    pub spend_amount: f64,
    pub receive_currency: String,
    pub payment_method: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuyCryptoOrder {
    pub id: String,
    pub spend_currency: String,
    pub spend_amount: f64,
    pub receive_currency: String,
    pub receive_amount: f64,
    pub rate: f64,
    pub payment_method: String,
    pub status: String,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentMethod {
    pub id: String,
    pub name: String,
    pub fee: f64,
    pub min_amount: f64,
    pub max_amount: f64,
    pub processing_time: String,
}

// ============ App State ============

pub struct AppState {
    pub trading_pairs: Mutex<Vec<TradingPair>>,
    pub futures_contracts: Mutex<Vec<FuturesContract>>,
    pub balances: Mutex<HashMap<String, Vec<WalletBalance>>>,
    pub orders: Mutex<HashMap<String, Vec<Order>>>,
    pub trades: Mutex<HashMap<String, Vec<Trade>>>,
    pub futures_orders: Mutex<HashMap<String, Vec<FuturesOrder>>>, // user_id -> futures orders
    pub positions: Mutex<HashMap<String, Vec<FuturesPosition>>>, // user_id -> positions
    pub earn_products: Mutex<Vec<EarnProduct>>,
    pub earn_subscriptions: Mutex<HashMap<String, Vec<EarnSubscription>>>,
    pub deposit_addresses: Mutex<HashMap<String, HashMap<String, DepositAddress>>>,
    pub transactions: Mutex<HashMap<String, Vec<Transaction>>>,
    pub buy_orders: Mutex<Vec<BuyCryptoOrder>>,
    pub users: Mutex<HashMap<String, User>>,
    pub sessions: Mutex<HashMap<String, String>>, // token -> user_id
    pub favorites: Mutex<HashMap<String, Vec<String>>>, // user_id -> list of favorite symbols
    pub kyc_submissions: Mutex<HashMap<String, KycSubmission>>, // user_id -> KYC submission
    pub withdraw_whitelist: Mutex<HashMap<String, Vec<WithdrawAddress>>>, // user_id -> whitelist addresses
    // Referral system
    pub invite_codes: Mutex<HashMap<String, String>>, // invite_code -> user_id (用户生成的邀请码)
    pub referrals: Mutex<HashMap<String, Referral>>, // referee_id -> Referral info
    pub referral_rewards: Mutex<HashMap<String, f64>>, // user_id -> pending reward amount
}

impl Default for AppState {
    fn default() -> Self {
        let pairs = vec![
            TradingPair {
                id: "btc-usdt".to_string(),
                base: "BTC".to_string(),
                quote: "USDT".to_string(),
                symbol: "BTC/USDT".to_string(),
                name: "Bitcoin".to_string(),
                price: 67432.50,
                change_24h: 2.34,
                volume_24h: 1234567.89,
                high_24h: 68000.00,
                low_24h: 66000.00,
                market_cap: 1320000000000.0,
            },
            TradingPair {
                id: "eth-usdt".to_string(),
                base: "ETH".to_string(),
                quote: "USDT".to_string(),
                symbol: "ETH/USDT".to_string(),
                name: "Ethereum".to_string(),
                price: 3456.78,
                change_24h: 1.56,
                volume_24h: 987654.32,
                high_24h: 3500.00,
                low_24h: 3400.00,
                market_cap: 415000000000.0,
            },
            TradingPair {
                id: "sol-usdt".to_string(),
                base: "SOL".to_string(),
                quote: "USDT".to_string(),
                symbol: "SOL/USDT".to_string(),
                name: "Solana".to_string(),
                price: 178.90,
                change_24h: -0.89,
                volume_24h: 456789.12,
                high_24h: 182.00,
                low_24h: 175.00,
                market_cap: 78000000000.0,
            },
            TradingPair {
                id: "bnb-usdt".to_string(),
                base: "BNB".to_string(),
                quote: "USDT".to_string(),
                symbol: "BNB/USDT".to_string(),
                name: "BNB".to_string(),
                price: 589.23,
                change_24h: -0.45,
                volume_24h: 234567.89,
                high_24h: 595.00,
                low_24h: 580.00,
                market_cap: 89000000000.0,
            },
            TradingPair {
                id: "xrp-usdt".to_string(),
                base: "XRP".to_string(),
                quote: "USDT".to_string(),
                symbol: "XRP/USDT".to_string(),
                name: "Ripple".to_string(),
                price: 0.6234,
                change_24h: -1.23,
                volume_24h: 345678.90,
                high_24h: 0.65,
                low_24h: 0.61,
                market_cap: 34000000000.0,
            },
            TradingPair {
                id: "ada-usdt".to_string(),
                base: "ADA".to_string(),
                quote: "USDT".to_string(),
                symbol: "ADA/USDT".to_string(),
                name: "Cardano".to_string(),
                price: 0.4567,
                change_24h: 0.89,
                volume_24h: 189234.56,
                high_24h: 0.47,
                low_24h: 0.44,
                market_cap: 16000000000.0,
            },
            TradingPair {
                id: "avax-usdt".to_string(),
                base: "AVAX".to_string(),
                quote: "USDT".to_string(),
                symbol: "AVAX/USDT".to_string(),
                name: "Avalanche".to_string(),
                price: 38.45,
                change_24h: 3.12,
                volume_24h: 123456.78,
                high_24h: 39.50,
                low_24h: 37.00,
                market_cap: 14000000000.0,
            },
            TradingPair {
                id: "doge-usdt".to_string(),
                base: "DOGE".to_string(),
                quote: "USDT".to_string(),
                symbol: "DOGE/USDT".to_string(),
                name: "Dogecoin".to_string(),
                price: 0.0823,
                change_24h: -2.34,
                volume_24h: 278901.23,
                high_24h: 0.086,
                low_24h: 0.080,
                market_cap: 11000000000.0,
            },
        ];

        // 理财产品数据
        let earn_products = vec![
            EarnProduct {
                id: "usdt-flexible".to_string(),
                symbol: "USDT".to_string(),
                name: "Tether US".to_string(),
                apr: 12.50,
                duration: "活期".to_string(),
                product_type: "赚币".to_string(),
                min_amount: 1.0,
                max_amount: None,
                tag: Some("热门".to_string()),
            },
            EarnProduct {
                id: "usdc-flexible".to_string(),
                symbol: "USDC".to_string(),
                name: "USD Coin".to_string(),
                apr: 10.20,
                duration: "活期".to_string(),
                product_type: "赚币".to_string(),
                min_amount: 1.0,
                max_amount: None,
                tag: None,
            },
            EarnProduct {
                id: "btc-flexible".to_string(),
                symbol: "BTC".to_string(),
                name: "Bitcoin".to_string(),
                apr: 2.50,
                duration: "活期".to_string(),
                product_type: "赚币".to_string(),
                min_amount: 0.0001,
                max_amount: None,
                tag: None,
            },
            EarnProduct {
                id: "eth-staking-120".to_string(),
                symbol: "ETH".to_string(),
                name: "Ethereum".to_string(),
                apr: 4.20,
                duration: "120天".to_string(),
                product_type: "质押".to_string(),
                min_amount: 0.01,
                max_amount: Some(1000.0),
                tag: Some("高收益".to_string()),
            },
            EarnProduct {
                id: "sol-staking-60".to_string(),
                symbol: "SOL".to_string(),
                name: "Solana".to_string(),
                apr: 6.80,
                duration: "60天".to_string(),
                product_type: "质押".to_string(),
                min_amount: 0.1,
                max_amount: None,
                tag: None,
            },
            EarnProduct {
                id: "bnb-flexible".to_string(),
                symbol: "BNB".to_string(),
                name: "BNB".to_string(),
                apr: 3.50,
                duration: "活期".to_string(),
                product_type: "收益池".to_string(),
                min_amount: 0.01,
                max_amount: None,
                tag: None,
            },
        ];

        // 预生成一些充值地址
        let mut deposit_addresses: HashMap<String, HashMap<String, DepositAddress>> = HashMap::new();
        
        let mut btc_addrs = HashMap::new();
        btc_addrs.insert("BTC".to_string(), DepositAddress {
            currency: "BTC".to_string(),
            address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh".to_string(),
            tag: None,
            network: "Bitcoin".to_string(),
        });
        deposit_addresses.insert("default".to_string(), btc_addrs);

        // 合约市场数据
        let futures_contracts = vec![
            FuturesContract {
                symbol: "BTCUSDT".to_string(),
                name: "BTC 永续".to_string(),
                price: 67432.50,
                change_24h: 2.34,
                volume_24h: 15200000000.0,
                funding_rate: 0.0001,
                next_funding_time: chrono::Utc::now().timestamp() + 28800,
                leverage: "125x".to_string(),
                contract_type: "U本位".to_string(),
            },
            FuturesContract {
                symbol: "ETHUSDT".to_string(),
                name: "ETH 永续".to_string(),
                price: 3456.78,
                change_24h: 1.89,
                volume_24h: 8900000000.0,
                funding_rate: 0.0001,
                next_funding_time: chrono::Utc::now().timestamp() + 28800,
                leverage: "100x".to_string(),
                contract_type: "U本位".to_string(),
            },
            FuturesContract {
                symbol: "SOLUSDT".to_string(),
                name: "SOL 永续".to_string(),
                price: 178.90,
                change_24h: 4.21,
                volume_24h: 5600000000.0,
                funding_rate: 0.000125,
                next_funding_time: chrono::Utc::now().timestamp() + 28800,
                leverage: "50x".to_string(),
                contract_type: "U本位".to_string(),
            },
            FuturesContract {
                symbol: "BNBUSDT".to_string(),
                name: "BNB 永续".to_string(),
                price: 589.23,
                change_24h: -0.45,
                volume_24h: 2300000000.0,
                funding_rate: 0.00008,
                next_funding_time: chrono::Utc::now().timestamp() + 28800,
                leverage: "75x".to_string(),
                contract_type: "U本位".to_string(),
            },
            FuturesContract {
                symbol: "DOGEUSDT".to_string(),
                name: "DOGE 永续".to_string(),
                price: 0.0823,
                change_24h: -2.34,
                volume_24h: 1200000000.0,
                funding_rate: -0.00005,
                next_funding_time: chrono::Utc::now().timestamp() + 28800,
                leverage: "25x".to_string(),
                contract_type: "U本位".to_string(),
            },
        ];

        AppState {
            trading_pairs: Mutex::new(pairs),
            futures_contracts: Mutex::new(futures_contracts),
            balances: Mutex::new(HashMap::new()),
            orders: Mutex::new(HashMap::new()),
            trades: Mutex::new(HashMap::new()),
            futures_orders: Mutex::new(HashMap::new()),
            positions: Mutex::new(HashMap::new()),
            earn_products: Mutex::new(earn_products),
            earn_subscriptions: Mutex::new(HashMap::new()),
            deposit_addresses: Mutex::new(deposit_addresses),
            transactions: Mutex::new(HashMap::new()),
            buy_orders: Mutex::new(Vec::new()),
            users: Mutex::new(HashMap::new()),
            sessions: Mutex::new(HashMap::new()),
            favorites: Mutex::new(HashMap::new()),
            kyc_submissions: Mutex::new(HashMap::new()),
            withdraw_whitelist: Mutex::new(HashMap::new()),
            // Referral system
            invite_codes: Mutex::new(HashMap::new()),
            referrals: Mutex::new(HashMap::new()),
            referral_rewards: Mutex::new(HashMap::new()),
        }
    }
}

// ============ Market APIs ============

// ============ Authentication APIs ============

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub username: String,
    pub password: String,
    pub invite_code: Option<String>,  // 邀请码（可选）
}

// ============ Referral Models ============

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Referral {
    pub referrer_id: String,      // 邀请人ID
    pub referee_id: String,       // 被邀请人ID
    pub invite_code: String,      // 邀请码
    pub reward_amount: f64,       // 已发放奖励金额
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReferralStats {
    pub total_referrals: i32,
    pub total_rewards: f64,
    pub pending_rewards: f64,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub username: String,  // 支持 username 或 email 登录
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: UserInfo,
}

#[derive(Debug, Serialize)]
pub struct UserInfo {
    pub id: String,
    pub email: String,
    pub username: String,
    pub kyc_status: String,
    pub kyc_level: i32,
    pub two_factor_enabled: bool,
}

async fn register(
    req: web::Json<RegisterRequest>,
    state: web::Data<AppState>,
) -> impl Responder {
    let email = req.email.to_lowercase();
    let users = state.users.lock().unwrap();
    
    // Check if email already exists
    for user in users.values() {
        if user.email == email {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "Email already registered"
            }));
        }
    }
    drop(users);
    
    // Hash password
    let password_hash = match hash(&req.password, DEFAULT_COST) {
        Ok(h) => h,
        Err(_) => return HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to process password"
        })),
    };
    
    let user_id = Uuid::new_v4().to_string();
    let user = User {
        id: user_id.clone(),
        email: email.clone(),
        username: req.username.clone(),
        password_hash,
        created_at: Utc::now().timestamp(),
        kyc_status: "none".to_string(),
        kyc_level: 0,
        two_factor_enabled: false,
        two_factor_secret: None,
    };
    
    // Save user
    let mut users = state.users.lock().unwrap();
    users.insert(user_id.clone(), user);
    
    // Generate session token
    let token = Uuid::new_v4().to_string();
    let mut sessions = state.sessions.lock().unwrap();
    sessions.insert(token.clone(), user_id.clone());
    
    // Create default balances for new user
    let mut balances = state.balances.lock().unwrap();
    balances.insert(user_id.clone(), vec![
        WalletBalance {
            currency: "USDT".to_string(),
            available: 10000.0,
            frozen: 0.0,
            total: 10000.0,
        },
        WalletBalance {
            currency: "BTC".to_string(),
            available: 0.0,
            frozen: 0.0,
            total: 0.0,
        },
        WalletBalance {
            currency: "ETH".to_string(),
            available: 0.0,
            frozen: 0.0,
            total: 0.0,
        },
    ]);
    
    // Generate invite code for new user (用于邀请其他人)
    let invite_code = format!("{}{}", req.username.to_uppercase(), &user_id[0..4]);
    let mut invite_codes = state.invite_codes.lock().unwrap();
    invite_codes.insert(invite_code.clone(), user_id.clone());
    
    // Handle referral: if invite_code provided, bind referral relationship
    let mut referral_bonus = 0.0;
    if let Some(ref code) = req.invite_code {
        let invite_codes = state.invite_codes.lock().unwrap();
        if let Some(referrer_id) = invite_codes.get(code).cloned() {
            drop(invite_codes); // Release the lock before acquiring others
            
            // Record referral relationship
            let mut referrals = state.referrals.lock().unwrap();
            referrals.insert(user_id.clone(), Referral {
                referrer_id: referrer_id.clone(),
                referee_id: user_id.clone(),
                invite_code: code.clone(),
                reward_amount: 0.0,
                created_at: Utc::now().timestamp(),
            });
            drop(referrals);
            
            // Grant referral bonus to referrer (模拟：注册成功后给邀请人 10 USDT)
            let mut referral_rewards = state.referral_rewards.lock().unwrap();
            let current_reward = referral_rewards.get(&referrer_id).copied().unwrap_or(0.0);
            referral_rewards.insert(referrer_id, current_reward + 10.0);
            referral_bonus = 10.0;
        }
    }
    
    let response = serde_json::json!({
        "token": token,
        "user": {
            "id": user_id,
            "email": email,
            "username": req.username.clone(),
            "kyc_status": "none",
            "kyc_level": 0,
            "two_factor_enabled": false,
        },
        "invite_code": invite_code,
        "referral_bonus": referral_bonus,
    });
    
    HttpResponse::Ok().json(response)
}

async fn login(
    req: web::Json<LoginRequest>,
    state: web::Data<AppState>,
) -> impl Responder {
    let username_or_email = req.username.to_lowercase();
    let users = state.users.lock().unwrap();
    
    // Find user by username or email
    let (user_id, user_email, username, kyc_status, two_factor_enabled, password_hash) = 
        if let Some(user) = users.values().find(|u| u.username.to_lowercase() == username_or_email || u.email == username_or_email) {
            (user.id.clone(), user.email.clone(), user.username.clone(), 
             user.kyc_status.clone(), user.two_factor_enabled, user.password_hash.clone())
        } else {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "Invalid username or password"
            }));
        };
    
    drop(users);
    
    // Verify password
    let valid = verify(&req.password, &password_hash).unwrap_or(false);
    
    if !valid {
        return HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Invalid username or password"
        }));
    }
    
    // Generate session token
    let token = Uuid::new_v4().to_string();
    let mut sessions = state.sessions.lock().unwrap();
    sessions.insert(token.clone(), user_id.clone());
    
    let response = AuthResponse {
        token,
        user: UserInfo {
            id: user_id,
            email: user_email,
            username,
            kyc_status,
            kyc_level: 0,
            two_factor_enabled,
        },
    };
    
    HttpResponse::Ok().json(response)
}

async fn logout(
    req: actix_web::HttpRequest,
    state: web::Data<AppState>,
) -> impl Responder {
    // Get token from header
    if let Some(auth) = req.headers().get("Authorization") {
        if let Ok(token) = auth.to_str() {
            if let Some(token) = token.strip_prefix("Bearer ") {
                let mut sessions = state.sessions.lock().unwrap();
                sessions.remove(token);
            }
        }
    }
    
    HttpResponse::Ok().json(serde_json::json!({"message": "Logged out successfully"}))
}

// ============ Referral APIs ============

// Get user's invite code
async fn get_invite_code(
    req: actix_web::HttpRequest,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = if let Some(auth) = req.headers().get("Authorization") {
        if let Ok(token) = auth.to_str() {
            if let Some(token) = token.strip_prefix("Bearer ") {
                let sessions = state.sessions.lock().unwrap();
                sessions.get(token).cloned()
            } else {
                None
            }
        } else {
            None
        }
    } else {
        None
    };
    
    if let Some(user_id) = user_id {
        let invite_codes = state.invite_codes.lock().unwrap();
        // Find the invite code for this user
        for (code, uid) in invite_codes.iter() {
            if uid == &user_id {
                return HttpResponse::Ok().json(serde_json::json!({
                    "invite_code": code,
                    "user_id": user_id,
                }));
            }
        }
        // If no invite code found, generate one
        let users = state.users.lock().unwrap();
        if let Some(user) = users.get(&user_id) {
            let invite_code = format!("{}{}", user.username.to_uppercase(), &user_id[0..4]);
            drop(users);
            let mut invite_codes = state.invite_codes.lock().unwrap();
            invite_codes.insert(invite_code.clone(), user_id.clone());
            return HttpResponse::Ok().json(serde_json::json!({
                "invite_code": invite_code,
                "user_id": user_id,
            }));
        }
    }
    
    HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"}))
}

// Get referral stats (我的邀请统计)
async fn get_referral_stats(
    req: actix_web::HttpRequest,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = if let Some(auth) = req.headers().get("Authorization") {
        if let Ok(token) = auth.to_str() {
            if let Some(token) = token.strip_prefix("Bearer ") {
                let sessions = state.sessions.lock().unwrap();
                sessions.get(token).cloned()
            } else {
                None
            }
        } else {
            None
        }
    } else {
        None
    };
    
    if let Some(user_id) = user_id {
        let referrals = state.referrals.lock().unwrap();
        let referral_rewards = state.referral_rewards.lock().unwrap();
        
        // Count total referrals (who used my invite code)
        let total_referrals = referrals.values()
            .filter(|r| r.referrer_id == user_id)
            .count() as i32;
        
        let total_rewards = referral_rewards.get(&user_id).unwrap_or(&0.0);
        
        HttpResponse::Ok().json(serde_json::json!({
            "total_referrals": total_referrals,
            "total_rewards": total_rewards,
            "pending_rewards": total_rewards, // 已发放奖励
        }))
    } else {
        HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"}))
    }
}

// Get referral list (邀请的人列表)
async fn get_referral_list(
    req: actix_web::HttpRequest,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = if let Some(auth) = req.headers().get("Authorization") {
        if let Ok(token) = auth.to_str() {
            if let Some(token) = token.strip_prefix("Bearer ") {
                let sessions = state.sessions.lock().unwrap();
                sessions.get(token).cloned()
            } else {
                None
            }
        } else {
            None
        }
    } else {
        None
    };
    
    if let Some(user_id) = user_id {
        let referrals = state.referrals.lock().unwrap();
        
        // Get all users I referred
        let referee_list: Vec<serde_json::Value> = referrals.values()
            .filter(|r| r.referrer_id == user_id)
            .map(|r| {
                serde_json::json!({
                    "user_id": r.referee_id,
                    "invite_code": r.invite_code,
                    "reward_amount": r.reward_amount,
                    "created_at": r.created_at,
                })
            })
            .collect();
        
        HttpResponse::Ok().json(serde_json::json!({
            "referrals": referee_list,
        }))
    } else {
        HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"}))
    }
}

async fn get_profile(
    req: actix_web::HttpRequest,
    state: web::Data<AppState>,
) -> impl Responder {
    // Get user from token
    let user_id = if let Some(auth) = req.headers().get("Authorization") {
        if let Ok(token) = auth.to_str() {
            if let Some(token) = token.strip_prefix("Bearer ") {
                let sessions = state.sessions.lock().unwrap();
                sessions.get(token).cloned()
            } else {
                None
            }
        } else {
            None
        }
    } else {
        None
    };
    
    if user_id.is_none() {
        return HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Not authenticated"
        }));
    }
    
    let users = state.users.lock().unwrap();
    if let Some(user) = users.get(&user_id.unwrap()) {
        HttpResponse::Ok().json(UserInfo {
            id: user.id.clone(),
            email: user.email.clone(),
            username: user.username.clone(),
            kyc_status: user.kyc_status.clone(),
            kyc_level: user.kyc_level,
            two_factor_enabled: user.two_factor_enabled,
        })
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "User not found"}))
    }
}

// ============ User Profile Update ============

#[derive(Deserialize)]
pub struct UpdateProfileRequest {
    pub username: Option<String>,
    pub email: Option<String>,
}

async fn update_profile(
    body: web::Json<UpdateProfileRequest>,
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = query.get("user_id").cloned().unwrap_or_else(|| "default".to_string());
    
    let mut users = state.users.lock().unwrap();
    if let Some(user) = users.get_mut(&user_id) {
        if let Some(new_username) = &body.username {
            user.username = new_username.clone();
        }
        if let Some(new_email) = &body.email {
            user.email = new_email.clone();
        }
        HttpResponse::Ok().json(UserInfo {
            id: user.id.clone(),
            email: user.email.clone(),
            username: user.username.clone(),
            kyc_status: user.kyc_status.clone(),
            kyc_level: user.kyc_level,
            two_factor_enabled: user.two_factor_enabled,
        })
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "User not found"}))
    }
}

async fn get_symbols(
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let search = query.get("search").cloned();
    let sort = query.get("sort").cloned();
    let pairs = state.trading_pairs.lock().unwrap();
    
    let mut filtered: Vec<TradingPair> = pairs.clone();
    
    // Search by symbol or name
    if let Some(ref s) = search {
        let s_lower = s.to_lowercase();
        filtered.retain(|p| p.symbol.to_lowercase().contains(&s_lower) || p.name.to_lowercase().contains(&s_lower) || p.base.to_lowercase().contains(&s_lower));
    }
    
    // Sort results
    if let Some(ref s) = sort {
        match s.as_str() {
            "price_asc" => filtered.sort_by(|a, b| a.price.partial_cmp(&b.price).unwrap()),
            "price_desc" => filtered.sort_by(|a, b| b.price.partial_cmp(&a.price).unwrap()),
            "change_asc" => filtered.sort_by(|a, b| a.change_24h.partial_cmp(&b.change_24h).unwrap()),
            "change_desc" => filtered.sort_by(|a, b| b.change_24h.partial_cmp(&a.change_24h).unwrap()),
            "volume_desc" => filtered.sort_by(|a, b| b.volume_24h.partial_cmp(&a.volume_24h).unwrap()),
            _ => {}
        }
    }
    
    HttpResponse::Ok().json(filtered)
}

// ============ Market Stats APIs ============

#[derive(Serialize)]
pub struct MarketStats {
    pub gainers: Vec<TradingPair>,
    pub losers: Vec<TradingPair>,
    pub volume_leaders: Vec<TradingPair>,
}

async fn get_market_stats(state: web::Data<AppState>) -> impl Responder {
    let pairs = state.trading_pairs.lock().unwrap();
    
    // Sort by change_24h for gainers/losers
    let mut sorted_by_change = pairs.clone();
    sorted_by_change.sort_by(|a, b| b.change_24h.partial_cmp(&a.change_24h).unwrap());
    
    let gainers: Vec<TradingPair> = sorted_by_change.iter().take(5).cloned().collect();
    let losers: Vec<TradingPair> = sorted_by_change.iter().rev().take(5).cloned().collect();
    
    // Sort by volume for volume leaders
    let mut sorted_by_volume = pairs.clone();
    sorted_by_volume.sort_by(|a, b| b.volume_24h.partial_cmp(&a.volume_24h).unwrap());
    let volume_leaders: Vec<TradingPair> = sorted_by_volume.iter().take(5).cloned().collect();
    
    HttpResponse::Ok().json(MarketStats {
        gainers,
        losers,
        volume_leaders,
    })
}

// ============ Favorites APIs ============

#[derive(Debug, Deserialize)]
pub struct FavoriteRequest {
    pub user_id: String,
    pub symbol: String,
}

async fn get_favorites(
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = query.get("user_id").cloned().unwrap_or_default();
    let favorites = state.favorites.lock().unwrap();
    let user_favorites = favorites.get(&user_id).cloned().unwrap_or_default();
    
    // Return favorite trading pairs
    let pairs = state.trading_pairs.lock().unwrap();
    let favorite_pairs: Vec<&TradingPair> = pairs.iter()
        .filter(|p| user_favorites.contains(&p.symbol))
        .collect();
    
    let result: Vec<TradingPair> = favorite_pairs.into_iter().cloned().collect();
    HttpResponse::Ok().json(result)
}

async fn add_favorite(
    body: web::Json<FavoriteRequest>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = &body.user_id;
    let symbol = &body.symbol;
    
    let mut favorites = state.favorites.lock().unwrap();
    let user_favorites = favorites.entry(user_id.clone()).or_default();
    
    if !user_favorites.contains(symbol) {
        user_favorites.push(symbol.clone());
    }
    
    HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "message": "Favorite added",
        "favorites": user_favorites.clone()
    }))
}

async fn remove_favorite(
    body: web::Json<FavoriteRequest>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = &body.user_id;
    let symbol = &body.symbol;
    
    let mut favorites = state.favorites.lock().unwrap();
    if let Some(user_favorites) = favorites.get_mut(user_id) {
        user_favorites.retain(|s| s != symbol);
    }
    
    HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "message": "Favorite removed"
    }))
}

// ============ Trading Pair Admin APIs ============

#[derive(Debug, Deserialize)]
pub struct CreateTradingPairRequest {
    pub base: String,
    pub quote: String,
    pub name: String,
    pub price: Option<f64>,
    pub market_cap: Option<f64>,
}

async fn create_trading_pair(
    req: web::Json<CreateTradingPairRequest>,
    state: web::Data<AppState>,
) -> impl Responder {
    let symbol = format!("{}_{}", req.base.to_uppercase(), req.quote.to_uppercase());
    let pair_id = uuid::Uuid::new_v4().to_string();
    
    let new_pair = TradingPair {
        id: pair_id.clone(),
        base: req.base.to_uppercase(),
        quote: req.quote.to_uppercase(),
        symbol: symbol.clone(),
        name: req.name.clone(),
        price: req.price.unwrap_or(0.0),
        change_24h: 0.0,
        volume_24h: 0.0,
        high_24h: req.price.unwrap_or(0.0),
        low_24h: req.price.unwrap_or(0.0),
        market_cap: req.market_cap.unwrap_or(0.0),
    };
    
    let mut pairs = state.trading_pairs.lock().unwrap();
    pairs.push(new_pair.clone());
    
    HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "message": "Trading pair created",
        "pair": new_pair
    }))
}

async fn update_trading_pair(
    symbol: web::Path<String>,
    req: web::Json<serde_json::Value>,
    state: web::Data<AppState>,
) -> impl Responder {
    let mut pairs = state.trading_pairs.lock().unwrap();
    
    if let Some(pair) = pairs.iter_mut().find(|p| p.symbol == symbol.as_str()) {
        if let Some(price) = req.get("price").and_then(|v| v.as_f64()) {
            let change = if pair.price > 0.0 {
                ((price - pair.price) / pair.price) * 100.0
            } else {
                0.0
            };
            pair.price = price;
            pair.change_24h = change;
            if price > pair.high_24h { pair.high_24h = price; }
            if price < pair.low_24h || pair.low_24h == 0.0 { pair.low_24h = price; }
        }
        if let Some(volume) = req.get("volume_24h").and_then(|v| v.as_f64()) {
            pair.volume_24h = volume;
        }
        if let Some(market_cap) = req.get("market_cap").and_then(|v| v.as_f64()) {
            pair.market_cap = market_cap;
        }
        
        HttpResponse::Ok().json(serde_json::json!({
            "success": true,
            "message": "Trading pair updated",
            "pair": pair.clone()
        }))
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "Trading pair not found"}))
    }
}

async fn delete_trading_pair(
    symbol: web::Path<String>,
    state: web::Data<AppState>,
) -> impl Responder {
    let mut pairs = state.trading_pairs.lock().unwrap();
    let initial_len = pairs.len();
    pairs.retain(|p| p.symbol != symbol.as_str());
    
    if pairs.len() < initial_len {
        HttpResponse::Ok().json(serde_json::json!({
            "success": true,
            "message": "Trading pair deleted"
        }))
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "Trading pair not found"}))
    }
}

async fn get_ticker(symbol: web::Path<String>, state: web::Data<AppState>) -> impl Responder {
    let pairs = state.trading_pairs.lock().unwrap();
    if let Some(pair) = pairs.iter().find(|p| p.symbol == symbol.as_str() || p.id == symbol.as_str()) {
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

// ============ Health Check ============

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    timestamp: i64,
    version: String,
}

async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(HealthResponse {
        status: "healthy".to_string(),
        timestamp: Utc::now().timestamp(),
        version: "1.0.0".to_string(),
    })
}

async fn get_depth(symbol: web::Path<String>, state: web::Data<AppState>) -> impl Responder {
    let pairs = state.trading_pairs.lock().unwrap();
    if let Some(pair) = pairs.iter().find(|p| p.symbol == symbol.as_str() || p.id == symbol.as_str()) {
        let base_price = pair.price;
        
        let bids = vec![
            OrderBookEntry { price: base_price * 0.9995, quantity: 1.234 },
            OrderBookEntry { price: base_price * 0.999, quantity: 2.567 },
            OrderBookEntry { price: base_price * 0.9985, quantity: 0.891 },
            OrderBookEntry { price: base_price * 0.998, quantity: 3.456 },
            OrderBookEntry { price: base_price * 0.9975, quantity: 1.789 },
        ];
        
        let asks = vec![
            OrderBookEntry { price: base_price * 1.0005, quantity: 0.567 },
            OrderBookEntry { price: base_price * 1.001, quantity: 2.123 },
            OrderBookEntry { price: base_price * 1.0015, quantity: 1.345 },
            OrderBookEntry { price: base_price * 1.002, quantity: 4.567 },
            OrderBookEntry { price: base_price * 1.0025, quantity: 0.987 },
        ];
        
        let orderbook = OrderBook {
            symbol: pair.symbol.clone(),
            bids,
            asks,
            timestamp: chrono::Utc::now().timestamp(),
        };
        HttpResponse::Ok().json(orderbook)
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "Symbol not found"}))
    }
}

async fn get_kline(
    symbol: web::Path<String>,
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let pairs = state.trading_pairs.lock().unwrap();
    if let Some(pair) = pairs.iter().find(|p| p.symbol == symbol.as_str() || p.id == symbol.as_str()) {
        let _interval = query.get("interval").map(|s| s.as_str()).unwrap_or("1h");
        let limit = query.get("limit").and_then(|s| s.parse().ok()).unwrap_or(100);
        
        let base_price = pair.price;
        let mut klines = Vec::new();
        let now = chrono::Utc::now().timestamp();
        
        for i in 0..limit {
            let ts = now - (limit - i) * 3600;
            let variance = (i as f64 % 10.0) / 100.0;
            let kline = Kline {
                timestamp: ts,
                open: base_price * (1.0 - variance),
                high: base_price * (1.0 + variance * 1.5),
                low: base_price * (1.0 - variance * 1.5),
                close: base_price * (1.0 + variance * 0.5),
                volume: 1000.0 + (i as f64 * 10.0),
            };
            klines.push(kline);
        }
        
        HttpResponse::Ok().json(klines)
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "Symbol not found"}))
    }
}

// ============ Wallet APIs ============

async fn get_balance(
    path: web::Path<String>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = path.as_str();
    let balances = state.balances.lock().unwrap();
    
    if let Some(user_balances) = balances.get(user_id) {
        HttpResponse::Ok().json(user_balances.clone())
    } else {
        // Return default balances for demo
        let default_balances = vec![
            WalletBalance {
                currency: "USDT".to_string(),
                available: 10000.0,
                frozen: 0.0,
                total: 10000.0,
            },
            WalletBalance {
                currency: "BTC".to_string(),
                available: 0.5,
                frozen: 0.0,
                total: 0.5,
            },
            WalletBalance {
                currency: "ETH".to_string(),
                available: 5.0,
                frozen: 0.0,
                total: 5.0,
            },
        ];
        HttpResponse::Ok().json(default_balances)
    }
}

#[derive(Debug, Deserialize)]
pub struct DepositAddressRequest {
    pub currency: String,
    pub network: Option<String>,
}

async fn get_deposit_address(
    req: web::Json<DepositAddressRequest>,
    state: web::Data<AppState>,
) -> impl Responder {
    let currency = req.currency.to_uppercase();
    let network = req.network.clone().unwrap_or_else(|| currency.clone());
    
    let _addresses = state.deposit_addresses.lock().unwrap();
    
    // 生成一个伪随机地址用于演示
    let address = match currency.as_str() {
        "BTC" => format!("bc1q{}", &uuid::Uuid::new_v4().to_string().replace("-", "")[..34]),
        "ETH" => format!("0x{}", &uuid::Uuid::new_v4().to_string().replace("-", "")[..40]),
        "USDT" => format!("0x{}", &uuid::Uuid::new_v4().to_string().replace("-", "")[..40]),
        _ => format!("{}:{}", currency.to_lowercase(), uuid::Uuid::new_v4()),
    };
    
    let deposit_addr = DepositAddress {
        currency: currency.clone(),
        address,
        tag: None,
        network,
    };
    
    HttpResponse::Ok().json(deposit_addr)
}

#[derive(Debug, Deserialize)]
pub struct WithdrawRequest {
    pub user_id: Option<String>,
    pub currency: String,
    pub amount: f64,
    pub address: String,
    pub network: Option<String>,
}

async fn withdraw(
    req: web::Json<WithdrawRequest>,
    _state: web::Data<AppState>,
) -> impl Responder {
    let user_id = req.user_id.clone().unwrap_or_else(|| "default".to_string());
    
    // 模拟提现请求
    let withdraw_id = uuid::Uuid::new_v4().to_string();
    
    let result = serde_json::json!({
        "id": withdraw_id,
        "user_id": user_id,
        "currency": req.currency,
        "amount": req.amount,
        "address": req.address,
        "network": req.network.clone().unwrap_or_else(|| req.currency.clone()),
        "status": "pending",
        "created_at": chrono::Utc::now().timestamp(),
        "message": "提现申请已提交，等待审核"
    });
    
    HttpResponse::Ok().json(result)
}

// ============ Earn APIs ============

async fn get_earn_products(state: web::Data<AppState>) -> impl Responder {
    let products = state.earn_products.lock().unwrap();
    HttpResponse::Ok().json(products.clone())
}

#[derive(Debug, Deserialize)]
pub struct SubscribeEarnRequest {
    pub product_id: String,
    pub amount: f64,
    pub user_id: Option<String>,  // 用户ID (可选，默认 "default")
}

async fn subscribe_earn(
    req: web::Json<SubscribeEarnRequest>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = req.user_id.clone().unwrap_or_else(|| "default".to_string());
    let products = state.earn_products.lock().unwrap();
    
    // 查找产品
    let product = products.iter().find(|p| p.id == req.product_id);
    
    if product.is_none() {
        return HttpResponse::NotFound().json(serde_json::json!({"error": "Product not found"}));
    }
    
    let product = product.unwrap();
    
    // 验证金额
    if req.amount < product.min_amount {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": format!("Minimum amount is {}", product.min_amount)
        }));
    }
    
    if let Some(max) = product.max_amount {
        if req.amount > max {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": format!("Maximum amount is {}", max)
            }));
        }
    }
    
    // 创建订阅记录
    let subscription = EarnSubscription {
        id: uuid::Uuid::new_v4().to_string(),
        product_id: req.product_id.clone(),
        symbol: product.symbol.clone(),
        amount: req.amount,
        apr: product.apr,
        start_time: chrono::Utc::now().timestamp(),
        status: "active".to_string(),
    };
    
    // 保存订阅
    let mut subscriptions = state.earn_subscriptions.lock().unwrap();
    subscriptions.entry(user_id).or_default().push(subscription.clone());
    
    HttpResponse::Ok().json(subscription)
}

async fn get_earn_holdings(
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = query.get("user_id").cloned().unwrap_or_else(|| "default".to_string());
    let subscriptions = state.earn_subscriptions.lock().unwrap();
    let holdings = subscriptions.get(&user_id).cloned().unwrap_or_default();
    HttpResponse::Ok().json(holdings)
}

// ============ Order APIs ============

#[derive(Debug, Deserialize)]
pub struct PlaceOrderRequest {
    pub symbol: String,
    pub side: String,
    pub order_type: String,  // limit, market, stop_loss, take_profit
    pub price: f64,
    pub quantity: f64,
    pub stop_price: Option<f64>,  // 止损止盈触发价格
    pub user_id: Option<String>,  // 用户ID (可选，默认 "default")
}

async fn place_order(
    req: web::Json<PlaceOrderRequest>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = req.user_id.clone().unwrap_or_else(|| "default".to_string());
    
    // 判断订单类型
    let order_trigger = match req.order_type.as_str() {
        "stop_loss" => Some("stop_loss".to_string()),
        "take_profit" => Some("take_profit".to_string()),
        _ => None,
    };
    
    let order = Order {
        id: uuid::Uuid::new_v4().to_string(),
        symbol: req.symbol.clone(),
        side: req.side.clone(),
        order_type: req.order_type.clone(),
        price: req.price,
        quantity: req.quantity,
        filled: 0.0,
        status: "pending".to_string(),
        stop_price: req.stop_price,
        order_trigger,
        created_at: chrono::Utc::now().timestamp(),
    };
    
    let order_id = order.id.clone();
    
    let mut orders = state.orders.lock().unwrap();
    orders.entry(user_id.clone()).or_default().push(order.clone());
    
    // 如果是市价单，立即成交
    if req.order_type == "market" {
        // 更新订单状态
        if let Some(user_orders) = orders.get_mut(&user_id) {
            if let Some(o) = user_orders.iter_mut().find(|o| o.id == order_id) {
                o.filled = req.quantity;
                o.status = "filled".to_string();
            }
        }
        
        // 生成成交记录
        let trade = Trade {
            id: uuid::Uuid::new_v4().to_string(),
            order_id: order_id.clone(),
            symbol: req.symbol.clone(),
            side: req.side.clone(),
            price: req.price,
            quantity: req.quantity,
            fee: req.price * req.quantity * 0.001, // 0.1% 手续费
            fee_currency: "USDT".to_string(),
            created_at: chrono::Utc::now().timestamp(),
        };
        
        drop(orders);
        
        let mut trades = state.trades.lock().unwrap();
        trades.entry(user_id).or_default().push(trade);
    }
    
    HttpResponse::Ok().json(order)
}

async fn get_orders(
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let symbol = query.get("symbol").cloned();
    let status = query.get("status").cloned();
    let side = query.get("side").cloned();
    let user_id = query.get("user_id").cloned().unwrap_or_else(|| "default".to_string());
    let orders = state.orders.lock().unwrap();
    
    let all_orders: Vec<Order> = orders.get(&user_id)
        .map(|os| {
            let mut filtered = os.clone();
            
            // Filter by symbol
            if let Some(ref sym) = symbol {
                filtered.retain(|o| &o.symbol == sym);
            }
            
            // Filter by status
            if let Some(ref s) = status {
                filtered.retain(|o| &o.status == s);
            }
            
            // Filter by side (buy/sell)
            if let Some(ref s) = side {
                filtered.retain(|o| &o.side == s);
            }
            
            filtered
        })
        .unwrap_or_default();
    
    HttpResponse::Ok().json(all_orders)
}

async fn cancel_order(
    path: web::Path<String>,
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let order_id = path.as_str();
    let user_id = query.get("user_id").cloned().unwrap_or_else(|| "default".to_string());
    let mut orders = state.orders.lock().unwrap();
    
    if let Some(user_orders) = orders.get_mut(&user_id) {
        if let Some(order) = user_orders.iter_mut().find(|o| o.id == order_id) {
            order.status = "cancelled".to_string();
            return HttpResponse::Ok().json(order.clone());
        }
    }
    
    HttpResponse::NotFound().json(serde_json::json!({"error": "Order not found"}))
}

// ============ Order Detail API ============

async fn get_order_detail(
    path: web::Path<String>,
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let order_id = path.as_str();
    let user_id = query.get("user_id").cloned().unwrap_or_else(|| "default".to_string());
    let orders = state.orders.lock().unwrap();
    
    if let Some(user_orders) = orders.get(&user_id) {
        if let Some(order) = user_orders.iter().find(|o| o.id == order_id) {
            return HttpResponse::Ok().json(order.clone());
        }
    }
    
    HttpResponse::NotFound().json(serde_json::json!({"error": "Order not found"}))
}

// ============ Trade History APIs ============

async fn get_trades(
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let symbol = query.get("symbol").cloned();
    let user_id = query.get("user_id").cloned().unwrap_or_else(|| "default".to_string());
    let trades = state.trades.lock().unwrap();
    
    let user_trades = trades.get(&user_id).cloned().unwrap_or_default();
    
    let filtered: Vec<Trade> = if let Some(ref sym) = symbol {
        user_trades.into_iter().filter(|t| &t.symbol == sym).collect()
    } else {
        user_trades
    };
    
    HttpResponse::Ok().json(filtered)
}

// ============ Stop-Loss/Take-Profit Order APIs ============

#[derive(Debug, Deserialize)]
pub struct CheckStopRequest {
    pub symbol: String,
    pub current_price: f64,
    pub user_id: Option<String>,  // 用户ID (可选，默认 "default")
}

/// 检查并触发止损止盈订单
/// 当市场价格达到止损/止盈价格时，自动成交
async fn check_stop_orders(
    req: web::Json<CheckStopRequest>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = req.user_id.clone().unwrap_or_else(|| "default".to_string());
    
    // 首先收集待触发的订单ID
    let (triggered_order_ids, triggered_orders_details): (Vec<String>, Vec<Order>) = {
        let orders = state.orders.lock().unwrap();
        let user_orders = orders.get(&user_id).cloned().unwrap_or_default();
        
        user_orders.into_iter()
            .filter(|order| {
                if order.status != "pending" {
                    return false;
                }
                if order.symbol != req.symbol {
                    return false;
                }
                if let Some(ref trigger) = order.order_trigger {
                    match trigger.as_str() {
                        "stop_loss" => order.side == "sell" && req.current_price <= order.stop_price.unwrap_or(0.0),
                        "take_profit" => order.side == "sell" && req.current_price >= order.stop_price.unwrap_or(0.0),
                        _ => false,
                    }
                } else {
                    false
                }
            })
            .map(|order| (order.id.clone(), order))
            .unzip()
    };
    
    // 如果没有触发的订单，直接返回
    if triggered_order_ids.is_empty() {
        return HttpResponse::Ok().json(serde_json::json!({
            "message": "No stop orders triggered",
            "symbol": req.symbol,
            "current_price": req.current_price,
            "triggered_orders": 0
        }));
    }
    
    // 更新订单状态
    {
        let mut orders = state.orders.lock().unwrap();
        if let Some(user_orders) = orders.get_mut(&user_id) {
            for order in user_orders.iter_mut() {
                if triggered_order_ids.contains(&order.id) {
                    order.filled = order.quantity;
                    order.status = "filled".to_string();
                }
            }
        }
    }
    
    // 生成成交记录
    let mut all_trades = Vec::new();
    for order in triggered_orders_details {
        let trade = Trade {
            id: uuid::Uuid::new_v4().to_string(),
            order_id: order.id.clone(),
            symbol: order.symbol.clone(),
            side: order.side.clone(),
            price: req.current_price,
            quantity: order.quantity,
            fee: req.current_price * order.quantity * 0.001,
            fee_currency: "USDT".to_string(),
            created_at: chrono::Utc::now().timestamp(),
        };
        all_trades.push(trade);
    }
    
    // 保存成交记录
    {
        let mut trades = state.trades.lock().unwrap();
        trades.entry(user_id).or_default().extend(all_trades);
    }
    
    let result = serde_json::json!({
        "message": "Stop orders checked",
        "symbol": req.symbol,
        "current_price": req.current_price,
        "triggered_orders": triggered_order_ids.len(),
        "order_ids": triggered_order_ids
    });
    
    HttpResponse::Ok().json(result)
}

// ============ Futures APIs ============

async fn get_futures_symbols(state: web::Data<AppState>) -> impl Responder {
    let contracts = state.futures_contracts.lock().unwrap();
    HttpResponse::Ok().json(contracts.clone())
}

async fn get_futures_ticker(
    symbol: web::Path<String>,
    state: web::Data<AppState>,
) -> impl Responder {
    let contracts = state.futures_contracts.lock().unwrap();
    if let Some(contract) = contracts.iter().find(|c| c.symbol == symbol.as_str()) {
        HttpResponse::Ok().json(contract.clone())
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "Contract not found"}))
    }
}

// ============ Futures Trading APIs ============

async fn place_futures_order(
    req: web::Json<FuturesOrderRequest>,
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = query.get("user_id").cloned().unwrap_or_else(|| "default".to_string());
    let leverage = req.leverage.unwrap_or(1).clamp(1, 125);
    
    // 获取合约当前价格
    let contracts = state.futures_contracts.lock().unwrap();
    let contract_price = if let Some(contract) = contracts.iter().find(|c| c.symbol == req.symbol) {
        contract.price
    } else {
        return HttpResponse::NotFound().json(serde_json::json!({"error": "Contract not found"}));
    };
    
    let order_price = req.price.unwrap_or(contract_price);
    let order_id = uuid::Uuid::new_v4().to_string();
    
    let futures_order = FuturesOrder {
        id: order_id.clone(),
        symbol: req.symbol.clone(),
        side: req.side.clone(),
        order_type: req.order_type.clone(),
        size: req.size,
        price: order_price,
        filled: 0.0,
        status: "open".to_string(),
        leverage,
        created_at: chrono::Utc::now().timestamp(),
    };
    
    // 如果是市价单，直接成交并创建仓位
    if req.order_type == "market" {
        let position_id = uuid::Uuid::new_v4().to_string();
        let position_size = req.size;
        
        // 计算仓位价值
        let position_value = position_size * order_price;
        let margin = position_value / leverage as f64;
        
        // 计算强平价格 (假设维持保证金率为 0.5%)
        let liquidation_price = if req.side == "buy" {
            order_price * (1.0 - 0.5 / leverage as f64)
        } else {
            order_price * (1.0 + 0.5 / leverage as f64)
        };
        
        let position = FuturesPosition {
            id: position_id,
            symbol: req.symbol.clone(),
            side: req.side.clone(),
            size: position_size,
            entry_price: order_price,
            leverage,
            margin,
            unrealized_pnl: 0.0,
            liquidation_price: Some(liquidation_price),
            open_time: chrono::Utc::now().timestamp(),
            status: "open".to_string(),
        };
        
        // 保存仓位
        let mut positions = state.positions.lock().unwrap();
        positions.entry(user_id.clone()).or_default().push(position);
        
        // 更新订单状态为成交
        let mut futures_orders = state.futures_orders.lock().unwrap();
        futures_orders.entry(user_id.clone()).or_default().push(FuturesOrder {
            filled: req.size,
            status: "filled".to_string(),
            ..futures_order
        });
        
        HttpResponse::Ok().json(serde_json::json!({
            "id": order_id,
            "symbol": req.symbol,
            "side": req.side,
            "order_type": req.order_type,
            "size": req.size,
            "price": order_price,
            "filled": req.size,
            "status": "filled",
            "leverage": leverage,
            "message": "订单已成交"
        }))
    } else {
        // 限价单
        let mut futures_orders = state.futures_orders.lock().unwrap();
        futures_orders.entry(user_id.clone()).or_default().push(futures_order);
        
        HttpResponse::Ok().json(serde_json::json!({
            "id": order_id,
            "symbol": req.symbol,
            "side": req.side,
            "order_type": req.order_type,
            "size": req.size,
            "price": order_price,
            "filled": 0.0,
            "status": "open",
            "leverage": leverage,
            "message": "限价单已提交"
        }))
    }
}

async fn get_futures_positions(
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = query.get("user_id").cloned().unwrap_or_else(|| "default".to_string());
    
    // 更新仓位盈亏
    let mut positions = state.positions.lock().unwrap();
    let contracts = state.futures_contracts.lock().unwrap();
    
    if let Some(user_positions) = positions.get_mut(&user_id) {
        for position in user_positions.iter_mut() {
            if position.status == "open" {
                if let Some(contract) = contracts.iter().find(|c| c.symbol == position.symbol) {
                    let price_diff = contract.price - position.entry_price;
                    let side_multiplier = if position.side == "long" { 1.0 } else { -1.0 };
                    position.unrealized_pnl = position.size * price_diff * side_multiplier;
                }
            }
        }
    }
    
    let user_positions = positions.get(&user_id).cloned().unwrap_or_default();
    HttpResponse::Ok().json(user_positions)
}

// ============ Position Detail API ============

async fn get_futures_position_detail(
    path: web::Path<String>,
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let position_id = path.as_str();
    let user_id = query.get("user_id").cloned().unwrap_or_else(|| "default".to_string());
    
    let mut positions = state.positions.lock().unwrap();
    let contracts = state.futures_contracts.lock().unwrap();
    
    // 更新仓位盈亏
    if let Some(user_positions) = positions.get_mut(&user_id) {
        for position in user_positions.iter_mut() {
            if position.status == "open" && position.id == position_id {
                if let Some(contract) = contracts.iter().find(|c| c.symbol == position.symbol) {
                    let price_diff = contract.price - position.entry_price;
                    let side_multiplier = if position.side == "long" { 1.0 } else { -1.0 };
                    position.unrealized_pnl = position.size * price_diff * side_multiplier;
                }
                return HttpResponse::Ok().json(position.clone());
            }
        }
    }
    
    HttpResponse::NotFound().json(serde_json::json!({"error": "Position not found"}))
}

async fn get_futures_orders(
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = query.get("user_id").cloned().unwrap_or_else(|| "default".to_string());
    let futures_orders = state.futures_orders.lock().unwrap();
    let user_orders = futures_orders.get(&user_id).cloned().unwrap_or_default();
    HttpResponse::Ok().json(user_orders)
}

async fn close_futures_position(
    position_id: web::Path<String>,
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = query.get("user_id").cloned().unwrap_or_else(|| "default".to_string());
    
    let mut positions = state.positions.lock().unwrap();
    
    if let Some(user_positions) = positions.get_mut(&user_id) {
        if let Some(position) = user_positions.iter_mut().find(|p| p.id == *position_id) {
            if position.status == "open" {
                position.status = "closed".to_string();
                
                return HttpResponse::Ok().json(serde_json::json!({
                    "id": position.id,
                    "symbol": position.symbol,
                    "side": position.side,
                    "size": position.size,
                    "entry_price": position.entry_price,
                    "unrealized_pnl": position.unrealized_pnl,
                    "status": "closed",
                    "message": "仓位已平仓"
                }));
            }
        }
    }
    
    HttpResponse::NotFound().json(serde_json::json!({"error": "Position not found"}))
}

// ============ Transfer APIs ============

#[derive(Debug, Deserialize)]
pub struct TransferRequest {
    pub currency: String,
    pub amount: f64,
    pub from_account: String,
    pub to_account: String,
    pub user_id: Option<String>,
}

async fn transfer(
    req: web::Json<TransferRequest>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = req.user_id.clone().unwrap_or_else(|| "default".to_string());
    
    // 模拟内部转账
    let tx_id = uuid::Uuid::new_v4().to_string();
    
    // 创建转账记录
    let transaction = Transaction {
        id: tx_id.clone(),
        tx_type: "transfer".to_string(),
        currency: req.currency.clone(),
        amount: req.amount,
        fee: 0.0,
        status: "completed".to_string(),
        address: Some(req.to_account.clone()),
        tx_hash: None,
        created_at: chrono::Utc::now().timestamp(),
        confirmations: None,
    };
    
    // 保存交易记录
    let mut transactions = state.transactions.lock().unwrap();
    transactions.entry(user_id.clone()).or_default().push(transaction.clone());
    
    let result = serde_json::json!({
        "id": tx_id,
        "currency": req.currency,
        "amount": req.amount,
        "from_account": req.from_account,
        "to_account": req.to_account,
        "status": "completed",
        "created_at": chrono::Utc::now().timestamp(),
        "message": "转账成功"
    });
    
    HttpResponse::Ok().json(result)
}

// ============ Transaction History APIs ============

async fn get_transactions(
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let tx_type = query.get("type").cloned();
    let user_id = query.get("user_id").cloned().unwrap_or_else(|| "default".to_string());
    let transactions = state.transactions.lock().unwrap();
    
    let user_txs = transactions.get(&user_id).cloned().unwrap_or_default();
    
    let filtered: Vec<Transaction> = if let Some(t) = tx_type {
        user_txs.into_iter().filter(|tx| tx.tx_type == t).collect()
    } else {
        user_txs
    };
    
    HttpResponse::Ok().json(filtered)
}

// ============ BuyCrypto/Fiat On-Ramp APIs ============

async fn get_fiat_price(
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let crypto = query.get("crypto").map(|s| s.to_uppercase()).unwrap_or_else(|| "BTC".to_string());
    let fiat = query.get("fiat").map(|s| s.to_uppercase()).unwrap_or_else(|| "USD".to_string());
    
    let pairs = state.trading_pairs.lock().unwrap();
    
    // 使用交易对的价格作为参考
    let price = if let Some(pair) = pairs.iter().find(|p| p.base == crypto) {
        pair.price
    } else {
        // 默认价格
        match crypto.as_str() {
            "BTC" => 67432.50,
            "ETH" => 3456.78,
            "SOL" => 178.90,
            _ => 100.0,
        }
    };
    
    let fiat_price = FiatPrice {
        crypto: crypto.clone(),
        fiat: fiat.clone(),
        crypto_price: price,
        fiat_price: price, // 简化：1:1 汇率
        min_amount: 15.0,
        max_amount: 20000.0,
    };
    
    HttpResponse::Ok().json(fiat_price)
}

async fn get_payment_methods() -> impl Responder {
    let methods = vec![
        PaymentMethod {
            id: "credit_card".to_string(),
            name: "信用卡/借记卡".to_string(),
            fee: 0.0,
            min_amount: 15.0,
            max_amount: 20000.0,
            processing_time: "即时到账".to_string(),
        },
        PaymentMethod {
            id: "debit_card".to_string(),
            name: "借记卡".to_string(),
            fee: 0.0,
            min_amount: 15.0,
            max_amount: 10000.0,
            processing_time: "即时到账".to_string(),
        },
        PaymentMethod {
            id: "bank_transfer".to_string(),
            name: "银行转账".to_string(),
            fee: 1.0,
            min_amount: 100.0,
            max_amount: 50000.0,
            processing_time: "1-3工作日".to_string(),
        },
    ];
    
    HttpResponse::Ok().json(methods)
}

async fn create_buy_order(
    req: web::Json<BuyCryptoRequest>,
    state: web::Data<AppState>,
) -> impl Responder {
    // 获取加密货币价格
    let pairs = state.trading_pairs.lock().unwrap();
    let price = if let Some(pair) = pairs.iter().find(|p| p.base == req.receive_currency) {
        pair.price
    } else {
        match req.receive_currency.to_uppercase().as_str() {
            "BTC" => 67432.50,
            "ETH" => 3456.78,
            "SOL" => 178.90,
            _ => 100.0,
        }
    };
    
    // 计算可获得的加密货币数量
    let receive_amount = req.spend_amount / price;
    let order = BuyCryptoOrder {
        id: uuid::Uuid::new_v4().to_string(),
        spend_currency: req.spend_currency.clone(),
        spend_amount: req.spend_amount,
        receive_currency: req.receive_currency.clone(),
        receive_amount,
        rate: price,
        payment_method: req.payment_method.clone(),
        status: "pending".to_string(),
        created_at: chrono::Utc::now().timestamp(),
    };
    
    // 保存订单
    let mut orders = state.buy_orders.lock().unwrap();
    orders.push(order.clone());
    
    HttpResponse::Ok().json(order)
}

async fn get_buy_orders(
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let status = query.get("status").cloned();
    let orders = state.buy_orders.lock().unwrap();
    
    let filtered: Vec<BuyCryptoOrder> = orders.iter()
        .filter(|o| {
            if let Some(ref s) = status {
                o.status == *s
            } else {
                true
            }
        })
        .cloned()
        .collect();
    
    HttpResponse::Ok().json(filtered)
}

// ============ Admin APIs ============

#[derive(Debug, Serialize)]
pub struct AdminUserInfo {
    pub id: String,
    pub email: String,
    pub username: String,
    pub kyc_status: String,
    pub kyc_level: i32,
    pub two_factor_enabled: bool,
    pub created_at: i64,
}

#[derive(Debug, Serialize)]
pub struct AdminSystemStats {
    pub total_users: usize,
    pub total_orders: usize,
    pub total_trades: usize,
    pub total_balances: f64,
    pub active_orders: usize,
    pub pending_kyc: usize,
}

async fn admin_get_users(state: web::Data<AppState>) -> impl Responder {
    let users = state.users.lock().unwrap();
    let user_list: Vec<AdminUserInfo> = users.values()
        .map(|u| AdminUserInfo {
            id: u.id.clone(),
            email: u.email.clone(),
            username: u.username.clone(),
            kyc_status: u.kyc_status.clone(),
            kyc_level: u.kyc_level,
            two_factor_enabled: u.two_factor_enabled,
            created_at: u.created_at,
        })
        .collect();
    HttpResponse::Ok().json(user_list)
}

async fn admin_get_all_orders(
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let status = query.get("status").cloned();
    let orders = state.orders.lock().unwrap();
    
    let mut all_orders: Vec<Order> = orders.values()
        .flat_map(|o| o.clone())
        .collect();
    
    if let Some(ref s) = status {
        all_orders.retain(|o| o.status == *s);
    }
    
    // Sort by created_at descending
    all_orders.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    
    HttpResponse::Ok().json(all_orders)
}

async fn admin_get_all_transactions(
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let tx_type = query.get("type").cloned();
    let transactions = state.transactions.lock().unwrap();
    
    let mut all_txs: Vec<Transaction> = transactions.values()
        .flat_map(|t| t.clone())
        .collect();
    
    if let Some(ref t) = tx_type {
        all_txs.retain(|tx| tx.tx_type == *t);
    }
    
    // Sort by created_at descending
    all_txs.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    
    HttpResponse::Ok().json(all_txs)
}

async fn admin_get_system_stats(state: web::Data<AppState>) -> impl Responder {
    let users = state.users.lock().unwrap();
    let orders = state.orders.lock().unwrap();
    let trades = state.trades.lock().unwrap();
    let balances = state.balances.lock().unwrap();
    let kyc = state.kyc_submissions.lock().unwrap();
    
    let total_orders: usize = orders.values().map(|o| o.len()).sum();
    let total_trades: usize = trades.values().map(|t| t.len()).sum();
    let total_balances: f64 = balances.values()
        .flat_map(|b| b.iter())
        .map(|w| w.total)
        .sum();
    let active_orders = orders.values()
        .flat_map(|o| o.iter())
        .filter(|o| o.status == "pending")
        .count();
    let pending_kyc = kyc.len();
    
    let stats = AdminSystemStats {
        total_users: users.len(),
        total_orders,
        total_trades,
        total_balances,
        active_orders,
        pending_kyc,
    };
    
    HttpResponse::Ok().json(stats)
}

async fn admin_cancel_order(
    path: web::Path<String>,
    state: web::Data<AppState>,
) -> impl Responder {
    let order_id = path.to_string();
    let mut orders = state.orders.lock().unwrap();
    
    for user_orders in orders.values_mut() {
        if let Some(order) = user_orders.iter_mut().find(|o| o.id == order_id) {
            if order.status == "pending" {
                order.status = "cancelled".to_string();
                return HttpResponse::Ok().json(serde_json::json!({
                    "success": true,
                    "message": "Order cancelled successfully"
                }));
            } else {
                return HttpResponse::BadRequest().json(serde_json::json!({
                    "error": "Can only cancel pending orders"
                }));
            }
        }
    }
    
    HttpResponse::NotFound().json(serde_json::json!({
        "error": "Order not found"
    }))
}

// ============ KYC APIs ============

#[derive(Debug, Deserialize)]
pub struct KycSubmitRequest {
    pub user_id: String,
    pub first_name: String,
    pub last_name: String,
    pub country: String,
    pub id_type: String,
    pub id_number: String,
    pub document_url: Option<String>,
}

async fn submit_kyc(
    req: web::Json<KycSubmitRequest>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = req.user_id.clone();
    
    // 保存 KYC 提交
    let submission = KycSubmission {
        first_name: req.first_name.clone(),
        last_name: req.last_name.clone(),
        country: req.country.clone(),
        id_type: req.id_type.clone(),
        id_number: req.id_number.clone(),
        document_url: req.document_url.clone(),
    };
    
    let mut kyc_submissions = state.kyc_submissions.lock().unwrap();
    kyc_submissions.insert(user_id.clone(), submission);
    
    // 更新用户 KYC 状态
    let mut users = state.users.lock().unwrap();
    if let Some(user) = users.get_mut(&user_id) {
        user.kyc_status = "pending".to_string();
    }
    
    HttpResponse::Ok().json(serde_json::json!({
        "message": "KYC submission received",
        "status": "pending",
        "user_id": user_id
    }))
}

async fn get_kyc_status(
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = query.get("user_id").cloned().unwrap_or_default();
    
    let users = state.users.lock().unwrap();
    if let Some(user) = users.get(&user_id) {
        let kyc_status = KycStatus {
            status: user.kyc_status.clone(),
            level: user.kyc_level,
            submitted_at: None,
            reviewed_at: None,
            rejection_reason: None,
        };
        HttpResponse::Ok().json(kyc_status)
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "User not found"}))
    }
}

// ============ 2FA APIs ============

#[derive(Debug, Deserialize)]
pub struct Enable2FARequest {
    pub user_id: String,
    pub secret: String,  // 简化：直接接受 secret，实际应使用 TOTP
}

#[derive(Debug, Serialize)]
pub struct Enable2FAResponse {
    pub enabled: bool,
    pub secret: String,
    pub message: String,
}

async fn enable_2fa(
    req: web::Json<Enable2FARequest>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = req.user_id.clone();
    
    let mut users = state.users.lock().unwrap();
    if let Some(user) = users.get_mut(&user_id) {
        user.two_factor_enabled = true;
        user.two_factor_secret = Some(req.secret.clone());
        
        let response = Enable2FAResponse {
            enabled: true,
            secret: req.secret.clone(),
            message: "2FA enabled successfully".to_string(),
        };
        HttpResponse::Ok().json(response)
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "User not found"}))
    }
}

#[derive(Debug, Deserialize)]
pub struct Disable2FARequest {
    pub user_id: String,
    pub code: String,  // 2FA 验证码
}

async fn disable_2fa(
    req: web::Json<Disable2FARequest>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = req.user_id.clone();
    
    // 简化验证：实际应验证 TOTP 代码
    let mut users = state.users.lock().unwrap();
    if let Some(user) = users.get_mut(&user_id) {
        if user.two_factor_enabled {
            user.two_factor_enabled = false;
            user.two_factor_secret = None;
            
            HttpResponse::Ok().json(serde_json::json!({
                "message": "2FA disabled successfully",
                "enabled": false
            }))
        } else {
            HttpResponse::BadRequest().json(serde_json::json!({
                "error": "2FA is not enabled"
            }))
        }
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "User not found"}))
    }
}

// ============ Withdraw Whitelist APIs ============

#[derive(Debug, Deserialize)]
pub struct AddWhitelistRequest {
    pub user_id: String,
    pub currency: String,
    pub address: String,
    pub network: String,
    pub label: String,
}

async fn add_withdraw_whitelist(
    req: web::Json<AddWhitelistRequest>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = req.user_id.clone();
    
    let whitelist_addr = WithdrawAddress {
        id: Uuid::new_v4().to_string(),
        currency: req.currency.clone(),
        address: req.address.clone(),
        tag: None,
        network: req.network.clone(),
        label: req.label.clone(),
        created_at: Utc::now().timestamp(),
    };
    
    let mut whitelist = state.withdraw_whitelist.lock().unwrap();
    let user_whitelist = whitelist.entry(user_id.clone()).or_default();
    user_whitelist.push(whitelist_addr.clone());
    
    HttpResponse::Ok().json(serde_json::json!({
        "message": "Address added to whitelist",
        "address": whitelist_addr
    }))
}

async fn get_withdraw_whitelist(
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = query.get("user_id").cloned().unwrap_or_default();
    
    let whitelist = state.withdraw_whitelist.lock().unwrap();
    let user_whitelist = whitelist.get(&user_id).cloned().unwrap_or_default();
    
    HttpResponse::Ok().json(user_whitelist)
}

async fn remove_from_whitelist(
    path: web::Path<String>,
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let address_id = path.as_str();
    let user_id = query.get("user_id").cloned().unwrap_or_default();
    
    let mut whitelist = state.withdraw_whitelist.lock().unwrap();
    if let Some(user_whitelist) = whitelist.get_mut(&user_id) {
        user_whitelist.retain(|a| a.id != address_id);
        HttpResponse::Ok().json(serde_json::json!({
            "message": "Address removed from whitelist"
        }))
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "Whitelist not found"}))
    }
}

// ============ Main ============

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    tracing_subscriber::fmt::init();
    
    let bind = "127.0.0.1:8080";
    println!("Starting CEX Server on http://{}", bind);
    
    HttpServer::new(|| {
        let state = web::Data::new(AppState::default());
        
        App::new()
            .app_data(state)
            // Health Check
            .route("/health", web::get().to(health_check))
            // Auth APIs
            .route("/api/v1/auth/register", web::post().to(register))
            .route("/api/v1/auth/login", web::post().to(login))
            .route("/api/v1/auth/logout", web::post().to(logout))
            // Referral APIs
            .route("/api/v1/referral/code", web::get().to(get_invite_code))
            .route("/api/v1/referral/stats", web::get().to(get_referral_stats))
            .route("/api/v1/referral/list", web::get().to(get_referral_list))
            // User APIs
            .route("/api/v1/user/profile", web::get().to(get_profile))
            .route("/api/v1/user/profile", web::put().to(update_profile))
            // KYC APIs
            .route("/api/v1/user/kyc/submit", web::post().to(submit_kyc))
            .route("/api/v1/user/kyc/status", web::get().to(get_kyc_status))
            // 2FA APIs
            .route("/api/v1/user/2fa/enable", web::post().to(enable_2fa))
            .route("/api/v1/user/2fa/disable", web::post().to(disable_2fa))
            // Withdraw Whitelist APIs
            .route("/api/v1/wallet/whitelist/add", web::post().to(add_withdraw_whitelist))
            .route("/api/v1/wallet/whitelist", web::get().to(get_withdraw_whitelist))
            .route("/api/v1/wallet/whitelist/{address_id}", web::delete().to(remove_from_whitelist))
            // Market APIs (现货)
            .route("/api/v1/market/symbols", web::get().to(get_symbols))
            .route("/api/v1/market/stats", web::get().to(get_market_stats))
            .route("/api/v1/market/ticker/{symbol}", web::get().to(get_ticker))
            .route("/api/v1/market/depth/{symbol}", web::get().to(get_depth))
            .route("/api/v1/market/kline/{symbol}", web::get().to(get_kline))
            .route("/api/v1/market/favorites", web::get().to(get_favorites))
            .route("/api/v1/market/favorites/add", web::post().to(add_favorite))
            .route("/api/v1/market/favorites/remove", web::post().to(remove_favorite))
            // Trading Pair Admin APIs
            .route("/api/v1/admin/trading-pair", web::post().to(create_trading_pair))
            .route("/api/v1/admin/trading-pair/{symbol}", web::put().to(update_trading_pair))
            .route("/api/v1/admin/trading-pair/{symbol}", web::delete().to(delete_trading_pair))
            // Futures APIs (合约)
            .route("/api/v1/futures/symbols", web::get().to(get_futures_symbols))
            .route("/api/v1/futures/ticker/{symbol}", web::get().to(get_futures_ticker))
            .route("/api/v1/futures/order", web::post().to(place_futures_order))
            .route("/api/v1/futures/positions", web::get().to(get_futures_positions))
            .route("/api/v1/futures/position/{position_id}", web::get().to(get_futures_position_detail))
            .route("/api/v1/futures/orders", web::get().to(get_futures_orders))
            .route("/api/v1/futures/position/{position_id}", web::delete().to(close_futures_position))
            // Wallet APIs
            .route("/api/v1/wallet/balance/{user_id}", web::get().to(get_balance))
            .route("/api/v1/wallet/deposit/address", web::post().to(get_deposit_address))
            .route("/api/v1/wallet/withdraw", web::post().to(withdraw))
            .route("/api/v1/wallet/transfer", web::post().to(transfer))
            .route("/api/v1/wallet/transactions", web::get().to(get_transactions))
            // Earn APIs
            .route("/api/v1/earn/products", web::get().to(get_earn_products))
            .route("/api/v1/earn/subscribe", web::post().to(subscribe_earn))
            .route("/api/v1/earn/holdings", web::get().to(get_earn_holdings))
            // Order APIs
            .route("/api/v1/order/place", web::post().to(place_order))
            .route("/api/v1/order/list", web::get().to(get_orders))
            .route("/api/v1/order/cancel/{order_id}", web::delete().to(cancel_order))
            .route("/api/v1/order/{order_id}", web::get().to(get_order_detail))
            .route("/api/v1/order/trades", web::get().to(get_trades))
            .route("/api/v1/order/check-stop", web::post().to(check_stop_orders))
            // BuyCrypto/Fiat On-Ramp APIs
            .route("/api/v1/buy/fiat-price", web::get().to(get_fiat_price))
            .route("/api/v1/buy/payment-methods", web::get().to(get_payment_methods))
            .route("/api/v1/buy/create-order", web::post().to(create_buy_order))
            .route("/api/v1/buy/orders", web::get().to(get_buy_orders))
            // Admin APIs
            .route("/api/v1/admin/users", web::get().to(admin_get_users))
            .route("/api/v1/admin/orders", web::get().to(admin_get_all_orders))
            .route("/api/v1/admin/transactions", web::get().to(admin_get_all_transactions))
            .route("/api/v1/admin/stats", web::get().to(admin_get_system_stats))
            .route("/api/v1/admin/orders/{order_id}", web::delete().to(admin_cancel_order))
            // Health check
            .route("/", web::get().to(|| async { "CEX API Server Running" }))
    })
    .bind(bind)?
    .run()
    .await
}
