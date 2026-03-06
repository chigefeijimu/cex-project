// JWT 认证模块
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

/// JWT Token 结构
#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct JwtClaims {
    pub sub: String,        // 用户 ID
    pub email: String,      // 用户邮箱
    pub exp: u64,          // 过期时间
    pub iat: u64,          // 签发时间
}

/// JWT Token 响应
#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct TokenResponse {
    pub access_token: String,
    pub token_type: String,
    pub expires_in: u64,
}

/// JWT 配置
#[allow(dead_code)]
pub struct JwtConfig {
    pub secret: String,
    pub expiration: u64, // 秒
}

impl Default for JwtConfig {
    fn default() -> Self {
        Self {
            secret: "cex-secret-key-change-in-production".to_string(),
            expiration: 86400, // 24小时
        }
    }
}

impl JwtConfig {
    #[allow(dead_code)]
    pub fn new(secret: String, expiration: u64) -> Self {
        Self { secret, expiration }
    }

    /// 生成 JWT Token
    #[allow(dead_code)]
    pub fn generate_token(&self, user_id: String, email: String) -> TokenResponse {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let claims = JwtClaims {
            sub: user_id,
            email,
            exp: now + self.expiration,
            iat: now,
        };

        // 简化版 token 生成 (实际项目应使用 jsonwebtoken crate)
        let header = base64_encode("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        let payload = base64_encode(&serde_json::to_string(&claims).unwrap_or_default());
        let signature = base64_encode(&format!("{}.{}", &claims.sub, &claims.email));

        let token = format!("{}.{}.{}", header, payload, signature);

        TokenResponse {
            access_token: token,
            token_type: "Bearer".to_string(),
            expires_in: self.expiration,
        }
    }

    /// 验证 JWT Token
    #[allow(dead_code)]
    pub fn verify_token(&self, token: &str) -> Option<JwtClaims> {
        let parts: Vec<&str> = token.split('.').collect();
        if parts.len() != 3 {
            return None;
        }

        let payload = base64_decode(parts[1])?;
        let claims: JwtClaims = serde_json::from_slice(&payload).ok()?;

        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        // 检查是否过期
        if claims.exp < now {
            return None;
        }

        Some(claims)
    }
}

/// 简单的 base64 编码
#[allow(dead_code)]
fn base64_encode(input: &str) -> String {
    let encoded = base64::Engine::encode(&base64::engine::general_purpose::STANDARD, input);
    encoded.replace('+', "-").replace('/', "_").replace("=", "")
}

/// 简单的 base64 解码
#[allow(dead_code)]
fn base64_decode(input: &str) -> Option<Vec<u8>> {
    let padded = match input.len() % 4 {
        2 => format!("{}==", input),
        3 => format!("{}=", input),
        _ => input.to_string(),
    };
    let normalized = padded.replace('-', "+").replace('_', "/");
    base64::Engine::decode(&base64::engine::general_purpose::STANDARD, &normalized).ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_and_verify_token() {
        let config = JwtConfig::default();
        let response = config.generate_token("user123".to_string(), "test@example.com".to_string());
        
        assert!(!response.access_token.is_empty());
        assert_eq!(response.token_type, "Bearer");
        
        let claims = config.verify_token(&response.access_token);
        assert!(claims.is_some());
        assert_eq!(claims.unwrap().sub, "user123");
    }
}
