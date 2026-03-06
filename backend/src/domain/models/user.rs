// Domain Models - 用户模型
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub email: String,
    pub username: String,
    pub password_hash: String,
    pub created_at: i64,
    pub kyc_status: String,
    pub kyc_level: i32,
    pub two_factor_enabled: bool,
    pub two_factor_secret: Option<String>,
}

impl User {
    pub fn new(email: String, username: String, password_hash: String) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            email,
            username,
            password_hash,
            created_at: chrono::Utc::now().timestamp(),
            kyc_status: "none".to_string(),
            kyc_level: 0,
            two_factor_enabled: false,
            two_factor_secret: None,
        }
    }
}

// 用户信息返回模型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserInfo {
    pub id: String,
    pub email: String,
    pub username: String,
    pub kyc_status: String,
    pub kyc_level: i32,
    pub two_factor_enabled: bool,
    pub created_at: i64,
}

impl From<&User> for UserInfo {
    fn from(user: &User) -> Self {
        Self {
            id: user.id.clone(),
            email: user.email.clone(),
            username: user.username.clone(),
            kyc_status: user.kyc_status.clone(),
            kyc_level: user.kyc_level,
            two_factor_enabled: user.two_factor_enabled,
            created_at: user.created_at,
        }
    }
}

// KYC 提交
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KycSubmission {
    pub first_name: String,
    pub last_name: String,
    pub country: String,
    pub id_type: String,
    pub id_number: String,
    pub document_url: Option<String>,
}

// KYC 状态
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KycStatus {
    pub status: String,
    pub level: i32,
    pub submitted_at: Option<i64>,
    pub reviewed_at: Option<i64>,
    pub rejection_reason: Option<String>,
}
