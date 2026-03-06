import { TrendingUp, TrendingDown, Volume2 } from 'lucide-react';

interface MarketPair {
  symbol: string;
  pair: string;
  price: number;
  change: number;
  volume: string;
}

const marketPairs: MarketPair[] = [
  { symbol: 'ETH', pair: 'ETH/USDT', price: 3234.67, change: 1.89, volume: '892M' },
  { symbol: 'BNB', pair: 'BNB/USDT', price: 589.23, change: -0.45, volume: '234M' },
  { symbol: 'SOL', pair: 'SOL/USDT', price: 145.67, change: 4.21, volume: '567M' },
  { symbol: 'XRP', pair: 'XRP/USDT', price: 0.6234, change: -1.23, volume: '345M' },
  { symbol: 'ADA', pair: 'ADA/USDT', price: 0.4567, change: 0.89, volume: '189M' },
];

export function MarketActivity() {
  return (
    <div className="bg-[#161a1e] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">市场活动</h3>
        <button className="text-xs text-[#f0b90b] hover:text-[#f0b90b]/80">
          查看更多
        </button>
      </div>

      <div className="space-y-2">
        {marketPairs.map(pair => (
          <button
            key={pair.pair}
            className="w-full flex flex-col xl:flex-row xl:items-center justify-between p-2 rounded hover:bg-[#1e2329] transition-colors gap-2"
          >
            <div className="flex items-center gap-2 min-w-0 w-full xl:w-auto">
              <div className="w-6 h-6 bg-[#f0b90b] rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0">
                {pair.symbol[0]}
              </div>
              <div className="text-left min-w-0 flex-1">
                <div className="text-sm font-medium text-white truncate">{pair.pair}</div>
                <div className="text-xs text-gray-400 flex items-center gap-1 truncate">
                  <Volume2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">{pair.volume}</span>
                </div>
              </div>
            </div>

            <div className="text-left xl:text-right shrink-0 flex flex-row xl:flex-col justify-between xl:justify-start w-full xl:w-auto items-center xl:items-end">
              <div className="text-sm font-medium text-white">
                ${pair.price.toLocaleString()}
              </div>
              <div className={`text-xs flex items-center gap-1 ${
                pair.change >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'
              }`}>
                {pair.change >= 0 ? (
                  <TrendingUp className="w-3 h-3 shrink-0" />
                ) : (
                  <TrendingDown className="w-3 h-3 shrink-0" />
                )}
                {pair.change >= 0 ? '+' : ''}{pair.change}%
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
