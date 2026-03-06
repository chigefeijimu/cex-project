// Handlers Module
pub mod auth;
pub mod market;
pub mod order;
pub mod wallet;
pub mod trading;
pub mod blockchain;
pub mod hot_wallet;
pub mod admin;

// 显式导入避免冲突
pub use auth::*;
pub use market::*;
pub use order::*;
pub use wallet::*;
pub use trading::*;

// 从 blockchain 只导入非冲突的项
pub use blockchain::{
    get_crypto_deposit_address, get_deposit_history, get_all_deposit_addresses,
    simulate_deposit_confirm, get_supported_currencies, get_networks,
    withdraw_crypto as blockchain_withdraw, get_withdraw_history,
};

// 从 hot_wallet 导入
pub use hot_wallet::{
    generate_user_hot_wallet, get_user_wallet_address, get_all_wallet_addresses,
    confirm_deposit, get_deposits, withdraw_crypto as hot_withdraw_crypto,
    get_withdrawals, get_hot_wallet_balance, get_fee_config,
};

pub use admin::*;
