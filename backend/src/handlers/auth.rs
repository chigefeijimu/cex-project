// Handlers - Auth Handlers
use actix_web::{web, HttpResponse, Responder};
use crate::application::dtos::*;
use crate::domain::*;
use crate::infrastructure::AppState;
use bcrypt::{hash, verify, DEFAULT_COST};

// 注册
pub async fn register(
    state: web::Data<AppState>,
    req: web::Json<RegisterRequest>,
) -> impl Responder {
    let mut users = state.users.lock().unwrap();
    
    // 检查邮箱是否已存在
    for user in users.values() {
        if user.email == req.email {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "Email already registered"
            }));
        }
    }
    
    let password_hash = hash(&req.password, DEFAULT_COST).unwrap();
    let user = User::new(req.email.clone(), req.username.clone(), password_hash);
    
    let user_info = UserInfo::from(&user);
    users.insert(user.id.clone(), user);
    
    // 生成邀请码
    let invite_code = uuid::Uuid::new_v4().to_string()[..8].to_string();
    state.invite_codes.lock().unwrap().insert(invite_code.clone(), user_info.id.clone());
    
    // 生成会话 token
    let token = uuid::Uuid::new_v4().to_string();
    state.sessions.lock().unwrap().insert(token.clone(), user_info.id.clone());
    
    HttpResponse::Ok().json(AuthResponse {
        token,
        user: user_info,
    })
}

// 登录
pub async fn login(
    state: web::Data<AppState>,
    req: web::Json<LoginRequest>,
) -> impl Responder {
    let users = state.users.lock().unwrap();
    
    for (id, user) in users.iter() {
        if user.email == req.email {
            if verify(&req.password, &user.password_hash).unwrap_or(false) {
                let user_info = UserInfo::from(user);
                let token = uuid::Uuid::new_v4().to_string();
                state.sessions.lock().unwrap().insert(token.clone(), id.clone());
                
                return HttpResponse::Ok().json(AuthResponse {
                    token,
                    user: user_info,
                });
            }
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "Invalid credentials"
            }));
        }
    }
    
    HttpResponse::Unauthorized().json(serde_json::json!({
        "error": "Invalid credentials"
    }))
}

// 登出
pub async fn logout(
    req: actix_web::HttpRequest,
    state: web::Data<AppState>,
) -> impl Responder {
    if let Some(auth) = req.headers().get("Authorization") {
        if let Ok(token) = auth.to_str() {
            if let Some(stripped) = token.strip_prefix("Bearer ") {
                let token = stripped.to_string();
                state.sessions.lock().unwrap().remove(&token);
            }
        }
    }
    
    HttpResponse::Ok().json(serde_json::json!({"message": "Logged out successfully"}))
}

// 获取用户信息
pub async fn get_profile(
    req: actix_web::HttpRequest,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = if let Some(auth) = req.headers().get("Authorization") {
        if let Ok(token) = auth.to_str() {
            if let Some(stripped) = token.strip_prefix("Bearer ") {
                state.sessions.lock().unwrap().get(stripped).cloned()
            } else {
                None
            }
        } else {
            None
        }
    } else {
        None
    };
    
    let user_id = match user_id {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };
    
    let users = state.users.lock().unwrap();
    if let Some(user) = users.get(&user_id) {
        HttpResponse::Ok().json(UserInfo::from(user))
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "User not found"}))
    }
}

// 更新用户资料
pub async fn update_profile(
    req: actix_web::HttpRequest,
    state: web::Data<AppState>,
    query: web::Query<std::collections::HashMap<String, String>>,
) -> impl Responder {
    let user_id = if let Some(auth) = req.headers().get("Authorization") {
        if let Ok(token) = auth.to_str() {
            if let Some(stripped) = token.strip_prefix("Bearer ") {
                state.sessions.lock().unwrap().get(stripped).cloned()
            } else {
                None
            }
        } else {
            None
        }
    } else {
        None
    };
    
    let user_id = match user_id {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };
    
    let mut users = state.users.lock().unwrap();
    if let Some(user) = users.get_mut(&user_id) {
        if let Some(username) = query.get("username") {
            user.username = username.clone();
        }
        HttpResponse::Ok().json(UserInfo::from(&*user))
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "User not found"}))
    }
}

// 获取邀请码
pub async fn get_invite_code(
    req: actix_web::HttpRequest,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = if let Some(auth) = req.headers().get("Authorization") {
        if let Ok(token) = auth.to_str() {
            if let Some(stripped) = token.strip_prefix("Bearer ") {
                state.sessions.lock().unwrap().get(stripped).cloned()
            } else {
                None
            }
        } else {
            None
        }
    } else {
        None
    };
    
    let user_id = match user_id {
        Some(id) => id,
        None => return HttpResponse::Ok().json(serde_json::json!({"invite_code": ""})),
    };
    
    let codes = state.invite_codes.lock().unwrap();
    for (code, uid) in codes.iter() {
        if uid == &user_id {
            return HttpResponse::Ok().json(serde_json::json!({"invite_code": code}));
        }
    }
    
    HttpResponse::Ok().json(serde_json::json!({"invite_code": ""}))
}

// 获取推荐统计
pub async fn get_referral_stats(
    req: actix_web::HttpRequest,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = if let Some(auth) = req.headers().get("Authorization") {
        if let Ok(token) = auth.to_str() {
            if let Some(stripped) = token.strip_prefix("Bearer ") {
                state.sessions.lock().unwrap().get(stripped).cloned()
            } else {
                None
            }
        } else {
            None
        }
    } else {
        None
    };
    
    let user_id = match user_id {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };
    
    let total_rewards = *state.referral_rewards.lock().unwrap().get(&user_id).unwrap_or(&0.0);
    
    HttpResponse::Ok().json(serde_json::json!({
        "total_rewards": total_rewards,
        "referral_count": 0
    }))
}

// 获取推荐列表
pub async fn get_referral_list(
    req: actix_web::HttpRequest,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = if let Some(auth) = req.headers().get("Authorization") {
        if let Ok(token) = auth.to_str() {
            if let Some(stripped) = token.strip_prefix("Bearer ") {
                state.sessions.lock().unwrap().get(stripped).cloned()
            } else {
                None
            }
        } else {
            None
        }
    } else {
        None
    };
    
    let _ = match user_id {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };
    
    HttpResponse::Ok().json(serde_json::json!({
        "list": []
    }))
}
