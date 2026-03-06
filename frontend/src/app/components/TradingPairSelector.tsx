import { useState } from 'react';
import { Star, Search, TrendingUp, TrendingDown } from 'lucide-react';

interface TradingPair {
  symbol: string;
  pair: string;
  price: number;
  change: number;
  volume: string;
  isFavorite?: boolean;
}

const tradingPairs: TradingPair[] = [
  { symbol: 'BTC', pair: 'BTC/USDT', price: 65432.50, change: 2.34, volume: '1.52B', isFavorite: true },
  { symbol: 'ETH', pair: 'ETH/USDT', price: 3234.67, change: 1.89, volume: '892M' },
  { symbol: 'BNB', pair: 'BNB/USDT', price: 589.23, change: -0.45, volume: '234M' },
  { symbol: 'SOL', pair: 'SOL/USDT', price: 145.67, change: 4.21, volume: '567M' },
  { symbol: 'XRP', pair: 'XRP/USDT', price: 0.6234, change: -1.23, volume: '345M' },
  { symbol: 'ADA', pair: 'ADA/USDT', price: 0.4567, change: 0.89, volume: '189M' },
  { symbol: 'AVAX', pair: 'AVAX/USDT', price: 38.45, change: 3.12, volume: '123M' },
  { symbol: 'DOGE', pair: 'DOGE/USDT', price: 0.0823, change: -2.34, volume: '278M' },
];

interface TradingPairSelectorProps {
  currentPair: string;
  onSelectPair: (pair: TradingPair) => void;
}

export function TradingPairSelector({ currentPair, onSelectPair }: TradingPairSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('favorites');

  const filteredPairs = tradingPairs.filter(pair => {
    const matchesSearch = pair.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pair.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'favorites' ? pair.isFavorite : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 hover:bg-[#1e2329] rounded transition-colors"
      >
        <span className="text-xl font-semibold text-white">{currentPair}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full mt-2 w-[500px] bg-[#1e2329] rounded-lg shadow-2xl z-50 border border-[#2b3139]">
            {/* Search */}
            <div className="p-4 border-b border-[#2b3139]">
              <div className="flex items-center bg-[#0b0e11] rounded px-3 py-2 gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-white flex-1"
                  autoFocus
                />
              </div>
            </div>

            {/* Categories */}
            <div className="flex items-center gap-4 px-4 py-2 border-b border-[#2b3139] text-sm">
              <button
                onClick={() => setCategory('favorites')}
                className={`${category === 'favorites' ? 'text-[#f0b90b]' : 'text-gray-400 hover:text-white'}`}
              >
                收藏
              </button>
              <button
                onClick={() => setCategory('spot')}
                className={`${category === 'spot' ? 'text-[#f0b90b]' : 'text-gray-400 hover:text-white'}`}
              >
                现货
              </button>
              <button
                onClick={() => setCategory('gainers')}
                className={`${category === 'gainers' ? 'text-[#f0b90b]' : 'text-gray-400 hover:text-white'}`}
              >
                涨幅榜
              </button>
            </div>

            {/* Headers */}
            <div className="grid grid-cols-4 gap-2 px-4 py-2 text-xs text-gray-400 border-b border-[#2b3139]">
              <div className="truncate">交易对</div>
              <div className="text-right truncate">最新价</div>
              <div className="text-right truncate">24h涨跌</div>
              <div className="text-right truncate">24h成交量</div>
            </div>

            {/* Pairs List */}
            <div className="max-h-[400px] overflow-y-auto">
              {filteredPairs.map((pair) => (
                <button
                  key={pair.pair}
                  onClick={() => {
                    onSelectPair(pair);
                    setIsOpen(false);
                  }}
                  className="w-full grid grid-cols-4 gap-2 px-4 py-3 hover:bg-[#2b3139] transition-colors text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Star className={`w-4 h-4 shrink-0 ${pair.isFavorite ? 'fill-[#f0b90b] text-[#f0b90b]' : 'text-gray-400'}`} />
                    <span className="text-white font-medium truncate">{pair.pair}</span>
                  </div>
                  <div className="text-right text-white truncate">{pair.price.toLocaleString()}</div>
                  <div className={`text-right flex items-center justify-end gap-1 truncate ${pair.change >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                    {pair.change >= 0 ? <TrendingUp className="w-3 h-3 shrink-0" /> : <TrendingDown className="w-3 h-3 shrink-0" />}
                    <span className="truncate">{pair.change >= 0 ? '+' : ''}{pair.change}%</span>
                  </div>
                  <div className="text-right text-gray-400 truncate">{pair.volume}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
