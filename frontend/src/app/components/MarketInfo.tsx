import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketInfoProps {
  currentPrice: number;
  selectedPair: string;
}

export function MarketInfo({ currentPrice, selectedPair }: MarketInfoProps) {
  const change24h = 2.34;
  const high24h = 67234.12;
  const low24h = 63891.45;
  const volume24hBTC = 23456.78;
  const volume24hUSDT = 1520000000;
  const isPositive = change24h >= 0;

  return (
    <div className="bg-[#0b0e11] border-b border-[#2b3139] px-6 py-3">
      <div className="flex items-center gap-8 overflow-x-auto">
        {/* Price */}
        <div>
          <div className={`text-2xl font-semibold ${isPositive ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
            {currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-400">
            ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* 24h Change */}
        <div className="min-w-[120px]">
          <div className="text-xs text-gray-400 mb-1">24h涨跌</div>
          <div className={`flex items-center gap-1 ${isPositive ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="font-semibold">{isPositive ? '+' : ''}{change24h}%</span>
          </div>
        </div>

        {/* 24h High */}
        <div className="min-w-[120px]">
          <div className="text-xs text-gray-400 mb-1">24h最高价</div>
          <div className="text-white font-medium">{high24h.toLocaleString()}</div>
        </div>

        {/* 24h Low */}
        <div className="min-w-[120px]">
          <div className="text-xs text-gray-400 mb-1">24h最低价</div>
          <div className="text-white font-medium">{low24h.toLocaleString()}</div>
        </div>

        {/* 24h Volume BTC */}
        <div className="min-w-[150px]">
          <div className="text-xs text-gray-400 mb-1">24h成交量(BTC)</div>
          <div className="text-white font-medium">{volume24hBTC.toLocaleString()}</div>
        </div>

        {/* 24h Volume USDT */}
        <div className="min-w-[150px]">
          <div className="text-xs text-gray-400 mb-1">24h成交量(USDT)</div>
          <div className="text-white font-medium">
            {(volume24hUSDT / 1000000000).toFixed(2)}B
          </div>
        </div>
      </div>
    </div>
  );
}
