// CEX API Service Layer
// Connects frontend to Rust backend

const API_BASE = 'http://localhost:8080/api/v1';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      return { error: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============ Auth APIs ============
export interface RegisterResponse {
  token: string;
  user: UserInfo;
  invite_code: string;
  referral_bonus: number;
}

export interface UserInfo {
  id: string;
  email: string;
  username: string;
  kyc_status: string;
  kyc_level: number;
  two_factor_enabled: boolean;
}

export const authApi = {
  register: (email: string, username: string, password: string, inviteCode?: string) =>
    request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password, invite_code: inviteCode }),
    }),
    
  login: (username: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
    
  logout: () =>
    request('/auth/logout', { method: 'POST' }),
    
  getProfile: () =>
    request('/user/profile'),
    
  updateProfile: (username?: string, email?: string, userId: string = 'default') =>
    request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify({ username, email }),
    }),
};

// ============ Referral APIs ============
export interface ReferralStats {
  total_referrals: number;
  total_rewards: number;
  pending_rewards: number;
}

export interface Referral {
  user_id: string;
  invite_code: string;
  reward_amount: number;
  created_at: number;
}

export const referralApi = {
  getInviteCode: () =>
    request<{ invite_code: string; user_id: string }>('/referral/code'),
    
  getStats: () =>
    request<ReferralStats>('/referral/stats'),
    
  getList: () =>
    request<{ referrals: Referral[] }>('/referral/list'),
};

// ============ Market APIs ============
export interface Symbol {
  symbol: string;
  name: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  high_24h: number;
  low_24h: number;
  market_cap?: number;
  is_favorite?: boolean;
}

export interface Ticker {
  symbol: string;
  price: number;
  change_24h: number;
  high_24h: number;
  low_24h: number;
  volume_24h: number;
}

export interface DepthItem {
  price: number;
  quantity: number;
}

export interface Depth {
  bids: DepthItem[];
  asks: DepthItem[];
}

export interface Kline {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketStats {
  gainers: Symbol[];
  losers: Symbol[];
  volume_leaders: Symbol[];
}

export const marketApi = {
  getSymbols: () =>
    request<Symbol[]>('/market/symbols'),
    
  getMarketStats: () =>
    request<MarketStats>('/market/stats'),
    
  getTicker: (symbol: string) =>
    request<Ticker>(`/market/ticker/${symbol}`),
    
  getDepth: (symbol: string) =>
    request<Depth>(`/market/depth/${symbol}`),
    
  getKline: (symbol: string, interval: string = '1h', limit: number = 100) =>
    request<Kline[]>(`/market/kline/${symbol}?interval=${interval}&limit=${limit}`),
    
  getFavorites: (userId: string = 'default') =>
    request<Symbol[]>(`/market/favorites?user_id=${userId}`),
    
  addFavorite: (symbol: string, userId: string = 'default') =>
    request('/market/favorites/add', {
      method: 'POST',
      body: JSON.stringify({ symbol, user_id: userId }),
    }),
    
  removeFavorite: (symbol: string, userId: string = 'default') =>
    request('/market/favorites/remove', {
      method: 'POST',
      body: JSON.stringify({ symbol, user_id: userId }),
    }),
};

// ============ Wallet APIs ============
export interface Balance {
  currency: string;
  total: number;
  available: number;
  frozen: number;
}

export const walletApi = {
  getBalance: (userId: string = 'default') =>
    request<Balance[]>(`/wallet/balance/${userId}`),
    
  getDepositAddress: (currency: string, userId: string = 'default') =>
    request<{ address: string }>('/wallet/deposit/address', {
      method: 'POST',
      body: JSON.stringify({ currency, user_id: userId }),
    }),
    
  withdraw: (currency: string, amount: number, address: string, userId: string = 'default') =>
    request('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ currency, amount, address, user_id: userId }),
    }),
    
  transfer: (from: string, to: string, amount: number, userId: string = 'default') =>
    request('/wallet/transfer', {
      method: 'POST',
      body: JSON.stringify({ from_account: from, to_account: to, amount, user_id: userId }),
    }),
    
  getTransactions: (userId: string, currency?: string) =>
    request(`/wallet/transactions?user_id=${userId}${currency ? `&currency=${currency}` : ''}`),

  // Whitelist APIs
  getWhitelist: (userId: string = 'default') =>
    request(`/wallet/whitelist?user_id=${userId}`),
    
  addToWhitelist: (currency: string, address: string, network: string, label: string, userId: string = 'default') =>
    request('/wallet/whitelist/add', {
      method: 'POST',
      body: JSON.stringify({ currency, address, network, label, user_id: userId }),
    }),
    
  removeFromWhitelist: (addressId: string, userId: string = 'default') =>
    request(`/wallet/whitelist/${addressId}?user_id=${userId}`, { method: 'DELETE' }),
};

// ============ Order APIs ============
export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market' | 'stop_loss' | 'take_profit';
  price: number;
  quantity: number;
  filled: number;
  status: string;
  created_at: number;
}

export interface Trade {
  id: string;
  order_id: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  fee: number;
  created_at: number;
}

export const orderApi = {
  place: (symbol: string, side: string, orderType: string, price: number, quantity: number, stopPrice?: number) =>
    request<Order>('/order/place', {
      method: 'POST',
      body: JSON.stringify({ symbol, side, order_type: orderType, price, quantity, stop_price: stopPrice }),
    }),
    
  cancel: (orderId: string, userId: string = 'default') =>
    request(`/order/cancel/${orderId}?user_id=${userId}`, { method: 'DELETE' }),
    
  list: (symbol?: string, status?: string, userId: string = 'default') =>
    request<Order[]>(`/order/list?user_id=${userId}${symbol ? `&symbol=${symbol}` : ''}${status ? `&status=${status}` : ''}`),
    
  getTrades: (symbol?: string, userId: string = 'default') =>
    request<Trade[]>(`/order/trades?user_id=${userId}${symbol ? `&symbol=${symbol}` : ''}`),
};

// ============ Earn APIs ============
export interface EarnProduct {
  id: string;
  symbol: string;
  name: string;
  apr: number;
  duration: string;
  product_type: string;
  min_amount: number;
  max_amount?: number;
  tag?: string;
}

export interface EarnHolding {
  id: string;
  product_id: string;
  symbol: string;
  amount: number;
  apr: number;
  start_time: number;
  status: string;
}

export const earnApi = {
  getProducts: () =>
    request<EarnProduct[]>('/earn/products'),
    
  subscribe: (productId: string, amount: number) =>
    request('/earn/subscribe', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, amount }),
    }),
    
  getHoldings: (userId: string = 'default') =>
    request<EarnHolding[]>(`/earn/holdings?user_id=${userId}`),
};

// ============ Futures APIs ============
export interface FuturesSymbol {
  symbol: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  funding_rate: number;
}

export const futuresApi = {
  getSymbols: () =>
    request<FuturesSymbol[]>('/futures/symbols'),
    
  getTicker: (symbol: string) =>
    request<FuturesSymbol>(`/futures/ticker/${symbol}`),
};

// ============ Buy Crypto APIs ============
export interface FiatPrice {
  crypto: string;
  fiat: string;
  crypto_price: number;
  fiat_price: number;
  min_amount: number;
  max_amount: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  fee: number;
  min_amount: number;
  max_amount: number;
  processing_time: string;
}

export interface BuyOrder {
  id: string;
  spend_currency: string;
  spend_amount: number;
  receive_currency: string;
  receive_amount: number;
  rate: number;
  payment_method: string;
  status: string;
  created_at: number;
}

export const buyCryptoApi = {
  getFiatPrice: (fiat: string, crypto: string) =>
    request<FiatPrice>(`/buy/fiat-price?fiat=${fiat}&crypto=${crypto}`),
    
  getPaymentMethods: () =>
    request<PaymentMethod[]>('/buy/payment-methods'),
    
  createOrder: (spendCurrency: string, spendAmount: number, receiveCurrency: string, paymentMethod: string) =>
    request<BuyOrder>('/buy/create-order', {
      method: 'POST',
      body: JSON.stringify({ spend_currency: spendCurrency, spend_amount: spendAmount, receive_currency: receiveCurrency, payment_method: paymentMethod }),
    }),
    
  getOrders: () =>
    request<BuyOrder[]>('/buy/orders'),
};

// ============ Admin APIs ============
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  created_at: number;
  kyc_level: number;
}

export interface AdminOrder {
  id: string;
  user_id: string;
  symbol: string;
  side: string;
  order_type: string;
  price: number;
  quantity: number;
  filled: number;
  status: string;
  created_at: number;
}

export interface AdminTransaction {
  id: string;
  user_id: string;
  tx_type: string;
  currency: string;
  amount: number;
  status: string;
  created_at: number;
}

export interface AdminStats {
  total_users: number;
  total_orders: number;
  total_transactions: number;
  total_volume: number;
  timestamp: number;
}

export const adminApi = {
  getUsers: () =>
    request<{ users: AdminUser[]; total: number }>('/admin/users'),
    
  getOrders: (symbol?: string, status?: string) =>
    request<{ orders: AdminOrder[]; total: number }>(`/admin/orders${symbol || status ? '?' : ''}${symbol ? `symbol=${symbol}` : ''}${symbol && status ? '&' : ''}${status ? `status=${status}` : ''}`),
    
  getTransactions: () =>
    request<{ transactions: AdminTransaction[]; total: number }>('/admin/transactions'),
    
  getStats: () =>
    request<AdminStats>('/admin/stats'),
    
  cancelOrder: (orderId: string) =>
    request(`/admin/orders/${orderId}`, { method: 'DELETE' }),
};
