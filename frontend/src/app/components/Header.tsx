import { TrendingUp, TrendingDown } from 'lucide-react';

interface HeaderProps {
  currentPrice: number;
}

export function Header({ currentPrice }: HeaderProps) {
  const change24h = 2.34;
  const isPositive = change24h > 0;

  return (
    <header className="bg-[#161a1e] border-b border-[#2b3139] px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold">BTC/USDT</h1>
          
          <div className="flex items-center gap-6">
            <div>
              <div className={`text-2xl font-semibold ${isPositive ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-400">
                ≈ ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-5 h-5 text-[#0ecb81]" />
              ) : (
                <TrendingDown className="w-5 h-5 text-[#f6465d]" />
              )}
              <span className={`${isPositive ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                {isPositive ? '+' : ''}{change24h}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div>
            <div className="text-gray-400">24h High</div>
            <div className="text-white">$67,234.12</div>
          </div>
          <div>
            <div className="text-gray-400">24h Low</div>
            <div className="text-white">$63,891.45</div>
          </div>
          <div>
            <div className="text-gray-400">24h Volume(BTC)</div>
            <div className="text-white">23,456.78</div>
          </div>
          <div>
            <div className="text-gray-400">24h Volume(USDT)</div>
            <div className="text-white">1.52B</div>
          </div>
        </div>
      </div>
    </header>
  );
}
