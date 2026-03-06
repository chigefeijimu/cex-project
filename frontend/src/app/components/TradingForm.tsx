import { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface TradingFormProps {
  currentPrice: number;
  onTrade: (type: 'buy' | 'sell', amount: number, price: number) => void;
  balances: {
    BTC: number;
    USDT: number;
  };
}

export function TradingForm({ currentPrice, onTrade, balances }: TradingFormProps) {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [price, setPrice] = useState(currentPrice.toString());
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
    <div className="bg-[#161a1e] rounded-lg p-4">
      {showNotification && (
        <div className={`mb-4 p-3 rounded ${activeTab === 'buy' ? 'bg-[#0ecb81]/20 text-[#0ecb81]' : 'bg-[#f6465d]/20 text-[#f6465d]'}`}>
          Order placed successfully!
        </div>
      )}

      {/* Buy/Sell Tabs */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setActiveTab('buy')}
          className={`py-2 rounded font-semibold transition-colors ${
            activeTab === 'buy'
              ? 'bg-[#0ecb81] text-white'
              : 'bg-[#1e2329] text-gray-400 hover:text-white'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`py-2 rounded font-semibold transition-colors ${
            activeTab === 'sell'
              ? 'bg-[#f6465d] text-white'
              : 'bg-[#1e2329] text-gray-400 hover:text-white'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Order Type */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setOrderType('limit')}
          className={`px-4 py-1 rounded text-sm ${
            orderType === 'limit'
              ? 'bg-[#2b3139] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Limit
        </button>
        <button
          onClick={() => setOrderType('market')}
          className={`px-4 py-1 rounded text-sm ${
            orderType === 'market'
              ? 'bg-[#2b3139] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Market
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Available Balance */}
        <div className="text-sm">
          <span className="text-gray-400">Available: </span>
          <span className="text-white">
            {activeTab === 'buy'
              ? `${balances.USDT.toLocaleString()} USDT`
              : `${balances.BTC.toFixed(6)} BTC`}
          </span>
        </div>

        {/* Price Input */}
        {orderType === 'limit' && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">Price</label>
            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#1e2329] border border-[#2b3139] rounded px-3 py-2 text-white focus:outline-none focus:border-[#474d57]"
                placeholder="0.00"
                step="0.01"
              />
              <span className="absolute right-3 top-2 text-gray-400">USDT</span>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Amount</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#1e2329] border border-[#2b3139] rounded px-3 py-2 text-white focus:outline-none focus:border-[#474d57]"
              placeholder="0.00"
              step="0.000001"
            />
            <span className="absolute right-3 top-2 text-gray-400">BTC</span>
          </div>
        </div>

        {/* Percentage Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[0.25, 0.5, 0.75, 1].map((percentage) => (
            <button
              key={percentage}
              type="button"
              onClick={() => setPercentage(percentage)}
              className="py-1 bg-[#1e2329] rounded text-sm text-gray-400 hover:text-white hover:bg-[#2b3139] transition-colors"
            >
              {percentage * 100}%
            </button>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total:</span>
          <span className="text-white">{calculateTotal()} USDT</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-3 rounded font-semibold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'buy'
              ? 'bg-[#0ecb81] hover:bg-[#0ecb81]/90 text-white'
              : 'bg-[#f6465d] hover:bg-[#f6465d]/90 text-white'
          }`}
        >
          {activeTab === 'buy' ? (
            <>
              <ArrowUpCircle className="w-5 h-5" />
              Buy BTC
            </>
          ) : (
            <>
              <ArrowDownCircle className="w-5 h-5" />
              Sell BTC
            </>
          )}
        </button>
      </form>
    </div>
  );
}
