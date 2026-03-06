// Infrastructure - App State
use std::sync::Mutex;
use crate::domain::*;

// 应用状态
pub struct AppState {
    pub users: Mutex<std::collections::HashMap<String, User>>,
    pub sessions: Mutex<std::collections::HashMap<String, String>>,
    pub trading_pairs: Mutex<std::collections::HashMap<String, TradingPair>>,
    pub orders: Mutex<std::collections::HashMap<String, Order>>,
    pub trades: Mutex<std::collections::HashMap<String, Trade>>,
    pub balances: Mutex<std::collections::HashMap<String, Vec<WalletBalance>>>,
    pub transactions: Mutex<std::collections::HashMap<String, Vec<Transaction>>>,
    pub positions: Mutex<std::collections::HashMap<String, Vec<FuturesPosition>>>,
    pub futures_orders: Mutex<std::collections::HashMap<String, Vec<FuturesOrder>>>,
    pub earn_products: Mutex<Vec<EarnProduct>>,
    pub earn_subscriptions: Mutex<std::collections::HashMap<String, Vec<EarnSubscription>>>,
    pub favorites: Mutex<std::collections::HashMap<String, Vec<String>>>,
    pub kyc_submissions: Mutex<std::collections::HashMap<String, KycSubmission>>,
    pub withdraw_whitelist: Mutex<std::collections::HashMap<String, Vec<WithdrawAddress>>>,
    pub referral_codes: Mutex<std::collections::HashMap<String, String>>,
    pub referral_rewards: Mutex<std::collections::HashMap<String, f64>>,
    pub invite_codes: Mutex<std::collections::HashMap<String, String>>,
    pub orderbooks: Mutex<std::collections::HashMap<String, OrderBook>>,
    pub klines: Mutex<std::collections::HashMap<String, Vec<Kline>>>,
    pub market_stats: Mutex<MarketStats>,
}

impl Default for AppState {
    fn default() -> Self {
        let mut trading_pairs = std::collections::HashMap::new();
        
        // 初始化交易对
        let btc = TradingPair::new("BTC".to_string(), "USDT".to_string(), "Bitcoin".to_string());
        let mut btc_pair = btc.clone();
        btc_pair.price = 65432.50;
        btc_pair.change_24h = 2.34;
        btc_pair.volume_24h = 1520000000.0;
        btc_pair.high_24h = 66000.0;
        btc_pair.low_24h = 64000.0;
        btc_pair.market_cap = 1200000000000.0;
        trading_pairs.insert(btc_pair.symbol.clone(), btc_pair);

        let eth = TradingPair::new("ETH".to_string(), "USDT".to_string(), "Ethereum".to_string());
        let mut eth_pair = eth.clone();
        eth_pair.price = 3234.67;
        eth_pair.change_24h = 1.89;
        eth_pair.volume_24h = 892000000.0;
        eth_pair.high_24h = 3300.0;
        eth_pair.low_24h = 3150.0;
        eth_pair.market_cap = 390000000000.0;
        trading_pairs.insert(eth_pair.symbol.clone(), eth_pair);

        let bnb = TradingPair::new("BNB".to_string(), "USDT".to_string(), "BNB".to_string());
        let mut bnb_pair = bnb.clone();
        bnb_pair.price = 589.23;
        bnb_pair.change_24h = -0.45;
        bnb_pair.volume_24h = 234000000.0;
        bnb_pair.high_24h = 600.0;
        bnb_pair.low_24h = 580.0;
        bnb_pair.market_cap = 90000000000.0;
        trading_pairs.insert(bnb_pair.symbol.clone(), bnb_pair);

        let sol = TradingPair::new("SOL".to_string(), "USDT".to_string(), "Solana".to_string());
        let mut sol_pair = sol.clone();
        sol_pair.price = 145.67;
        sol_pair.change_24h = 4.21;
        sol_pair.volume_24h = 567000000.0;
        sol_pair.high_24h = 150.0;
        sol_pair.low_24h = 140.0;
        sol_pair.market_cap = 65000000000.0;
        trading_pairs.insert(sol_pair.symbol.clone(), sol_pair);

        // 初始化订单簿
        let mut orderbooks = std::collections::HashMap::new();
        for (symbol, pair) in &trading_pairs {
            let price = pair.price;
            let mut bids = Vec::new();
            let mut asks = Vec::new();
            
            for i in 0..10 {
                let bid_price = price * (1.0 - 0.001 * (i as f64 + 1.0));
                let ask_price = price * (1.0 + 0.001 * (i as f64 + 1.0));
                let qty = 1.0 + (i as f64) * 0.5;
                
                bids.push(OrderBookEntry { price: bid_price, quantity: qty });
                asks.push(OrderBookEntry { price: ask_price, quantity: qty });
            }
            
            orderbooks.insert(symbol.clone(), OrderBook {
                symbol: symbol.clone(),
                bids,
                asks,
                timestamp: chrono::Utc::now().timestamp(),
            });
        }

        // 初始化市场统计
        let market_stats = MarketStats {
            total_volume_24h: 3500000000.0,
            total_trades_24h: 1250000,
            btc_dominance: 52.5,
            active_markets: trading_pairs.len() as i32,
        };

        // 初始化理财产品
        let mut earn_products = Vec::new();
        earn_products.push(EarnProduct::new("BTC 定期".to_string(), "BTC".to_string(), 5.5, 0.01, 30 * 24 * 3600));
        earn_products.push(EarnProduct::new("ETH 定期".to_string(), "ETH".to_string(), 4.2, 0.1, 30 * 24 * 3600));
        earn_products.push(EarnProduct::new("USDT 定期".to_string(), "USDT".to_string(), 8.5, 100.0, 7 * 24 * 3600));

        Self {
            users: Mutex::new(std::collections::HashMap::new()),
            sessions: Mutex::new(std::collections::HashMap::new()),
            trading_pairs: Mutex::new(trading_pairs),
            orders: Mutex::new(std::collections::HashMap::new()),
            trades: Mutex::new(std::collections::HashMap::new()),
            balances: Mutex::new(std::collections::HashMap::new()),
            transactions: Mutex::new(std::collections::HashMap::new()),
            positions: Mutex::new(std::collections::HashMap::new()),
            futures_orders: Mutex::new(std::collections::HashMap::new()),
            earn_products: Mutex::new(earn_products),
            earn_subscriptions: Mutex::new(std::collections::HashMap::new()),
            favorites: Mutex::new(std::collections::HashMap::new()),
            kyc_submissions: Mutex::new(std::collections::HashMap::new()),
            withdraw_whitelist: Mutex::new(std::collections::HashMap::new()),
            referral_codes: Mutex::new(std::collections::HashMap::new()),
            referral_rewards: Mutex::new(std::collections::HashMap::new()),
            invite_codes: Mutex::new(std::collections::HashMap::new()),
            orderbooks: Mutex::new(orderbooks),
            klines: Mutex::new(std::collections::HashMap::new()),
            market_stats: Mutex::new(market_stats),
        }
    }
}
