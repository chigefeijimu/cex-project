// WebSocket 模块 - 实时行情推送
use actix::{Actor, StreamHandler};
use actix_web::web;
use actix_web_actors::ws;
use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Deserialize, Serialize};

/// WebSocket 消息类型
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
#[allow(dead_code)]
pub enum WsMessage {
    /// 订阅行情
    Subscribe { symbols: Vec<String> },
    /// 取消订阅
    Unsubscribe { symbols: Vec<String> },
    /// 行情更新
    TickerUpdate {
        symbol: String,
        price: f64,
        change_24h: f64,
        volume_24h: f64,
        high_24h: f64,
        low_24h: f64,
    },
    /// 订单簿更新
    DepthUpdate {
        symbol: String,
        bids: Vec<(f64, f64)>,
        asks: Vec<(f64, f64)>,
    },
    /// 成交推送
    TradeUpdate {
        symbol: String,
        price: f64,
        quantity: f64,
        side: String,
        timestamp: i64,
    },
    /// 心跳
    Ping { timestamp: i64 },
    Pong { timestamp: i64 },
}

/// WebSocket 会话
pub struct WsSession {
    pub id: String,
    pub subscribed_symbols: Vec<String>,
}

impl WsSession {
    pub fn new() -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            subscribed_symbols: Vec::new(),
        }
    }
}

impl Default for WsSession {
    fn default() -> Self {
        Self::new()
    }
}

impl Actor for WsSession {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        println!("WebSocket client connected: {}", self.id);
        
        // 发送欢迎消息
        let msg = serde_json::json!({
            "type": "connected",
            "session_id": self.id,
            "message": "Connected to CEX WebSocket server"
        });
        ctx.text(msg.to_string());
    }

    fn stopped(&mut self, _ctx: &mut Self::Context) {
        println!("WebSocket client disconnected: {}", self.id);
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for WsSession {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Text(text)) => {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&text) {
                    match parsed.get("type").and_then(|v| v.as_str()) {
                        Some("Subscribe") => {
                            if let Some(symbols) = parsed.get("symbols").and_then(|v| v.as_array()) {
                                for symbol in symbols {
                                    if let Some(s) = symbol.as_str() {
                                        if !self.subscribed_symbols.contains(&s.to_string()) {
                                            self.subscribed_symbols.push(s.to_string());
                                        }
                                    }
                                }
                                ctx.text(serde_json::json!({
                                    "type": "subscribed",
                                    "symbols": self.subscribed_symbols
                                }).to_string());
                            }
                        }
                        Some("Unsubscribe") => {
                            if let Some(symbols) = parsed.get("symbols").and_then(|v| v.as_array()) {
                                for symbol in symbols {
                                    if let Some(s) = symbol.as_str() {
                                        self.subscribed_symbols.retain(|x| x != s);
                                    }
                                }
                            }
                        }
                        Some("ping") => {
                            let now = SystemTime::now()
                                .duration_since(UNIX_EPOCH)
                                .unwrap()
                                .as_millis() as i64;
                            ctx.text(serde_json::json!({
                                "type": "pong",
                                "timestamp": now
                            }).to_string());
                        }
                        _ => {}
                    }
                }
            }
            Ok(ws::Message::Close(_)) => {
                ctx.close(None);
            }
            _ => {}
        }
    }
}

/// WebSocket 状态
#[allow(dead_code)]
pub struct WsState {
    pub subscribed_count: web::Data<std::sync::Mutex<usize>>,
}

impl WsState {
    pub fn new() -> Self {
        Self {
            subscribed_count: web::Data::new(std::sync::Mutex::new(0)),
        }
    }
}

impl Default for WsState {
    fn default() -> Self {
        Self::new()
    }
}
