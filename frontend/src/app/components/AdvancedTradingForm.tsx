import { useState } from 'react';
import { Info } from 'lucide-react';

interface AdvancedTradingFormProps {
  currentPrice: number;
  onTrade: (type: 'buy' | 'sell', amount: number, price: number) => void;
  balances: {
    BTC: number;
    USDT: number;
  };
}

type OrderTypeTab = 'limit' | 'market' | 'stop-limit';

export function AdvancedTradingForm({ currentPrice, onTrade, balances }: AdvancedTradingFormProps) {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<OrderTypeTab>('limit');
  const [price, setPrice] = useState(currentPrice.toString());
  const [stopPrice, setStopPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tradePrice = orderType === 'market' ? currentPrice : parseFloat(price);
    const tradeAmount = parseFloat(amount);

    if (!tradeAmount || tradeAmount <= 0) return;

    onTrade(activeTab, tradeAmount, tradePrice);
    setAmount('');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const calculateTotal = () => {
    const tradePrice = orderType === 'market' ? currentPrice : parseFloat(price) || 0;
    const tradeAmount = parseFloat(amount) || 0;
    return (tradePrice * tradeAmount).toFixed(2);
  };

  const setPercentage = (percentage: number) => {
    if (activeTab === 'buy') {
      const available = balances.USDT;
      const tradePrice = orderType === 'market' ? currentPrice : parseFloat(price) || currentPrice;
      const maxAmount = (available * percentage) / tradePrice;
      setAmount(maxAmount.toFixed(6));
    } else {
      const available = balances.BTC;
      const maxAmount = available * percentage;
      setAmount(maxAmount.toFixed(6));
    }
  };

  return (
    <div className="bg-[#161a1e] rounded-lg">
      {showNotification && (
        <div className={`m-4 p-3 rounded ${activeTab === 'buy' ? 'bg-[#0ecb81]/20 text-[#0ecb81]' : 'bg-[#f6465d]/20 text-[#f6465d]'}`}>
          订单已提交
        </div>
      )}

      {/* Buy/Sell Tabs */}
      <div className="grid grid-cols-2 gap-0 border-b border-[#2b3139]">
        <button
          onClick={() => setActiveTab('buy')}
          className={`py-3 font-semibold transition-colors relative ${
            activeTab === 'buy'
              ? 'text-[#0ecb81]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          买入
          {activeTab === 'buy' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0ecb81]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`py-3 font-semibold transition-colors relative ${
            activeTab === 'sell'
              ? 'text-[#f6465d]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          卖出
          {activeTab === 'sell' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f6465d]" />
          )}
        </button>
      </div>

      <div className="p-4">
        {/* Order Type Tabs */}
        <div className="flex gap-1 mb-4 text-xs">
          <button
            onClick={() => setOrderType('limit')}
            className={`px-3 py-1.5 rounded transition-colors ${
              orderType === 'limit'
                ? 'bg-[#2b3139] text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#1e2329]'
            }`}
          >
            限价单
          </button>
          <button
            onClick={() => setOrderType('market')}
            className={`px-3 py-1.5 rounded transition-colors ${
              orderType === 'market'
                ? 'bg-[#2b3139] text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#1e2329]'
            }`}
          >
            市价单
          </button>
          <button
            onClick={() => setOrderType('stop-limit')}
            className={`px-3 py-1.5 rounded transition-colors ${
              orderType === 'stop-limit'
                ? 'bg-[#2b3139] text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#1e2329]'
            }`}
          >
            止损限价
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Available Balance */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">可用</span>
            <span className="text-white">
              {activeTab === 'buy'
                ? `${balances.USDT.toLocaleString()} USDT`
                : `${balances.BTC.toFixed(6)} BTC`}
            </span>
          </div>

          {/* Stop Price (for stop-limit orders) */}
          {orderType === 'stop-limit' && (
            <div>
              <label className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                触发价格
                <Info className="w-3 h-3" />
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(e.target.value)}
                  className="w-full bg-[#1e2329] border border-[#2b3139] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#474d57]"
                  placeholder="0.00"
                  step="0.01"
                />
                <span className="absolute right-3 top-2 text-xs text-gray-400">USDT</span>
              </div>
            </div>
          )}

          {/* Price Input (not for market orders) */}
          {orderType !== 'market' && (
            <div>
              <label className="block text-xs text-gray-400 mb-2">价格</label>
              <div className="relative">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-[#1e2329] border border-[#2b3139] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#474d57]"
                  placeholder="0.00"
                  step="0.01"
                />
                <span className="absolute right-3 top-2 text-xs text-gray-400">USDT</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {[-10, -5, -1, 1, 5, 10].map(offset => (
                  <button
                    key={offset}
                    type="button"
                    onClick={() => {
                      const newPrice = parseFloat(price) + offset;
                      setPrice(newPrice.toFixed(2));
                    }}
                    className="flex-1 py-1 bg-[#1e2329] rounded text-xs text-gray-400 hover:text-white hover:bg-[#2b3139] transition-colors"
                  >
                    {offset > 0 ? '+' : ''}{offset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">数量</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#1e2329] border border-[#2b3139] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#474d57]"
                placeholder="0.00"
                step="0.000001"
              />
              <span className="absolute right-3 top-2 text-xs text-gray-400">BTC</span>
            </div>
          </div>

          {/* Percentage Slider */}
          <div>
            <div className="flex justify-between mb-2 text-xs text-gray-400">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              onChange={(e) => setPercentage(parseInt(e.target.value) / 100)}
              className="w-full h-1 bg-[#2b3139] rounded-lg appearance-none cursor-pointer accent-[#f0b90b]"
            />
          </div>

          {/* Quick Percentage Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map(percentage => (
              <button
                key={percentage}
                type="button"
                onClick={() => setPercentage(percentage / 100)}
                className="py-2 bg-[#1e2329] rounded text-xs text-gray-400 hover:text-white hover:bg-[#2b3139] transition-colors"
              >
                {percentage}%
              </button>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between text-xs py-2 border-t border-[#2b3139]">
            <span className="text-gray-400">总额</span>
            <span className="text-white font-medium">{calculateTotal()} USDT</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 rounded font-semibold transition-colors ${
              activeTab === 'buy'
                ? 'bg-[#0ecb81] hover:bg-[#0ecb81]/90 text-white'
                : 'bg-[#f6465d] hover:bg-[#f6465d]/90 text-white'
            }`}
          >
            {activeTab === 'buy' ? '买入' : '卖出'} BTC
          </button>

          {/* Additional Info */}
          <div className="text-xs text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>手续费</span>
              <span>0.1%</span>
            </div>
            <div className="flex justify-between">
              <span>预计手续费</span>
              <span>{(parseFloat(calculateTotal()) * 0.001).toFixed(2)} USDT</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
