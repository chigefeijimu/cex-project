// Application Layer - DTOs
use serde::{Deserialize, Serialize};

// Auth DTOs
#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub username: String,
    pub password: String,
    pub invite_code: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: crate::domain::UserInfo,
}

// User DTOs
#[derive(Debug, Deserialize)]
pub struct UpdateProfileRequest {
    pub username: Option<String>,
    pub email: Option<String>,
}

// Market DTOs
#[derive(Debug, Deserialize)]
pub struct GetSymbolsQuery {
    pub search: Option<String>,
    pub sort: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct GetKlineQuery {
    pub interval: Option<String>,
    pub start_time: Option<i64>,
    pub end_time: Option<i64>,
    pub limit: Option<usize>,
}

// Order DTOs
#[derive(Debug, Deserialize)]
pub struct PlaceOrderRequest {
    pub symbol: String,
    pub side: String,
    pub order_type: String,
    pub price: f64,
    pub quantity: f64,
    pub stop_price: Option<f64>,
    pub order_trigger: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct OrderResponse {
    pub order: crate::domain::Order,
}

// Wallet DTOs
#[derive(Debug, Deserialize)]
pub struct DepositAddressRequest {
    pub currency: String,
    pub network: String,
}

#[derive(Debug, Deserialize)]
pub struct WithdrawRequest {
    pub currency: String,
    pub address: String,
    pub amount: f64,
    pub network: String,
    pub tag: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct TransferRequest {
    pub from_currency: String,
    pub to_currency: String,
    pub amount: f64,
}

// Earn DTOs
#[derive(Debug, Deserialize)]
pub struct SubscribeEarnRequest {
    pub product_id: String,
    pub amount: f64,
}

// Futures DTOs
#[derive(Debug, Deserialize)]
pub struct PlaceFuturesOrderRequest {
    pub symbol: String,
    pub side: String,
    pub order_type: String,
    pub size: f64,
    pub price: Option<f64>,
    pub leverage: Option<i32>,
}

// Buy Crypto DTOs
#[derive(Debug, Deserialize)]
pub struct CreateBuyOrderRequest {
    pub fiat_currency: String,
    pub crypto_currency: String,
    pub amount: f64,
    pub payment_method_id: String,
}

#[derive(Debug, Serialize)]
pub struct FiatPrice {
    pub fiat_currency: String,
    pub crypto_currency: String,
    pub price: f64,
    pub limit_min: f64,
    pub limit_max: f64,
}

#[derive(Debug, Serialize)]
pub struct PaymentMethod {
    pub id: String,
    pub name: String,
    pub method_type: String,
}
