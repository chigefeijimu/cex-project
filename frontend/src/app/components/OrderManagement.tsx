import { useState } from 'react';
import { X, Filter } from 'lucide-react';

interface Order {
  id: string;
  time: string;
  pair: string;
  type: 'buy' | 'sell';
  side: 'limit' | 'market';
  price: number;
  amount: number;
  filled: number;
  total: number;
  status: 'open' | 'filled' | 'cancelled';
}

interface Asset {
  currency: string;
  total: number;
  available: number;
  inOrder: number;
  btcValue: number;
}

const mockOpenOrders: Order[] = [
  {
    id: '1',
    time: '2026-01-10 14:23:45',
    pair: 'BTC/USDT',
    type: 'buy',
    side: 'limit',
    price: 64500,
    amount: 0.5,
    filled: 0.2,
    total: 32250,
    status: 'open'
  },
  {
    id: '2',
    time: '2026-01-10 14:15:32',
    pair: 'ETH/USDT',
    type: 'sell',
    side: 'limit',
    price: 3250,
    amount: 2.0,
    filled: 0,
    total: 6500,
    status: 'open'
  }
];

const mockOrderHistory: Order[] = [
  {
    id: '3',
    time: '2026-01-10 13:45:12',
    pair: 'BTC/USDT',
    type: 'buy',
    side: 'market',
    price: 65200,
    amount: 0.1,
    filled: 0.1,
    total: 6520,
    status: 'filled'
  },
  {
    id: '4',
    time: '2026-01-10 12:30:45',
    pair: 'BTC/USDT',
    type: 'sell',
    side: 'limit',
    price: 65800,
    amount: 0.3,
    filled: 0.3,
    total: 19740,
    status: 'filled'
  },
  {
    id: '5',
    time: '2026-01-10 11:20:33',
    pair: 'ETH/USDT',
    type: 'buy',
    side: 'limit',
    price: 3200,
    amount: 1.5,
    filled: 0,
    total: 4800,
    status: 'cancelled'
  }
];

const mockAssets: Asset[] = [
  {
    currency: 'BTC',
    total: 0.5234,
    available: 0.3234,
    inOrder: 0.2,
    btcValue: 0.5234
  },
  {
    currency: 'ETH',
    total: 5.6789,
    available: 3.6789,
    inOrder: 2.0,
    btcValue: 0.2801
  },
  {
    currency: 'USDT',
    total: 15234.67,
    available: 15234.67,
    inOrder: 0,
    btcValue: 0.2329
  },
  {
    currency: 'BNB',
    total: 12.456,
    available: 12.456,
    inOrder: 0,
    btcValue: 0.1123
  }
];

export function OrderManagement() {
  const [activeTab, setActiveTab] = useState<'open' | 'history' | 'funds'>('open');
  const [openOrders, setOpenOrders] = useState(mockOpenOrders);

  const handleCancelOrder = (orderId: string) => {
    setOpenOrders(prev => prev.filter(order => order.id !== orderId));
  };

  const tabs = [
    { id: 'open', label: '当前委托', count: openOrders.length },
    { id: 'history', label: '历史订单', count: mockOrderHistory.length },
    { id: 'funds', label: '资产', count: mockAssets.length }
  ];

  return (
    <div className="bg-[#161a1e] rounded-lg">
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-[#2b3139] px-4">
        <div className="flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 text-sm relative ${
                activeTab === tab.id
                  ? 'text-[#f0b90b]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 text-xs">({tab.count})</span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f0b90b]" />
              )}
            </button>
          ))}
        </div>
        <button className="p-2 text-gray-400 hover:text-white">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'open' && (
          <div>
            {openOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="mb-2">暂无委托订单</div>
                <div className="text-xs">您可以在交易表单中创建新的订单</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-xs">
                      <th className="text-left py-2 px-2 font-medium">时间</th>
                      <th className="text-left py-2 px-2 font-medium">交易对</th>
                      <th className="text-left py-2 px-2 font-medium">类型</th>
                      <th className="text-left py-2 px-2 font-medium">方向</th>
                      <th className="text-right py-2 px-2 font-medium">价格</th>
                      <th className="text-right py-2 px-2 font-medium">数量</th>
                      <th className="text-right py-2 px-2 font-medium">已成交</th>
                      <th className="text-right py-2 px-2 font-medium">总额</th>
                      <th className="text-center py-2 px-2 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openOrders.map(order => (
                      <tr key={order.id} className="border-t border-[#2b3139]/50 hover:bg-[#1e2329]">
                        <td className="py-3 px-2 text-gray-400">{order.time}</td>
                        <td className="py-3 px-2 text-white">{order.pair}</td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-0.5 rounded text-xs bg-[#2b3139] text-gray-400">
                            {order.side === 'limit' ? '限价' : '市价'}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`${order.type === 'buy' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                            {order.type === 'buy' ? '买入' : '卖出'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right text-white">{order.price.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right text-white">{order.amount}</td>
                        <td className="py-3 px-2 text-right text-gray-400">
                          {order.filled} / {order.amount}
                        </td>
                        <td className="py-3 px-2 text-right text-white">{order.total.toLocaleString()}</td>
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="text-[#f6465d] hover:text-[#f6465d]/80 text-xs"
                          >
                            取消
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs">
                  <th className="text-left py-2 px-2 font-medium">时间</th>
                  <th className="text-left py-2 px-2 font-medium">交易对</th>
                  <th className="text-left py-2 px-2 font-medium">类型</th>
                  <th className="text-left py-2 px-2 font-medium">方向</th>
                  <th className="text-right py-2 px-2 font-medium">价格</th>
                  <th className="text-right py-2 px-2 font-medium">数量</th>
                  <th className="text-right py-2 px-2 font-medium">总额</th>
                  <th className="text-left py-2 px-2 font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {mockOrderHistory.map(order => (
                  <tr key={order.id} className="border-t border-[#2b3139]/50 hover:bg-[#1e2329]">
                    <td className="py-3 px-2 text-gray-400">{order.time}</td>
                    <td className="py-3 px-2 text-white">{order.pair}</td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded text-xs bg-[#2b3139] text-gray-400">
                        {order.side === 'limit' ? '限价' : '市价'}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`${order.type === 'buy' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                        {order.type === 'buy' ? '买入' : '卖出'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-white">{order.price.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right text-white">{order.amount}</td>
                    <td className="py-3 px-2 text-right text-white">{order.total.toLocaleString()}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        order.status === 'filled'
                          ? 'bg-[#0ecb81]/20 text-[#0ecb81]'
                          : 'bg-[#2b3139] text-gray-400'
                      }`}>
                        {order.status === 'filled' ? '已成交' : '已取消'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'funds' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs">
                  <th className="text-left py-2 px-2 font-medium">币种</th>
                  <th className="text-right py-2 px-2 font-medium">总额</th>
                  <th className="text-right py-2 px-2 font-medium">可用</th>
                  <th className="text-right py-2 px-2 font-medium">冻结</th>
                  <th className="text-right py-2 px-2 font-medium">BTC估值</th>
                </tr>
              </thead>
              <tbody>
                {mockAssets.map(asset => (
                  <tr key={asset.currency} className="border-t border-[#2b3139]/50 hover:bg-[#1e2329]">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#f0b90b] rounded-full flex items-center justify-center text-xs font-bold text-black">
                          {asset.currency[0]}
                        </div>
                        <span className="text-white font-medium">{asset.currency}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right text-white">{asset.total.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right text-white">{asset.available.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right text-gray-400">{asset.inOrder.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right text-gray-400">{asset.btcValue.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 pt-4 border-t border-[#2b3139] flex justify-between text-sm">
              <span className="text-gray-400">总估值 (BTC)</span>
              <span className="text-white font-semibold">
                {mockAssets.reduce((sum, asset) => sum + asset.btcValue, 0).toFixed(4)} BTC
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
