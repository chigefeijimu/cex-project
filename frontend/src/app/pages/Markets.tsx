import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Star, TrendingUp, TrendingDown, Search, ArrowRight } from 'lucide-react';
import { marketApi, type Symbol } from '../services/api';

const MOCK_MARKETS = [
  { symbol: 'BTC', name: 'Bitcoin', price: 65432.50, change: 2.34, volume: '1.52B', marketCap: '1.2T' },
  { symbol: 'ETH', name: 'Ethereum', price: 3234.67, change: 1.89, volume: '892M', marketCap: '390B' },
  { symbol: 'BNB', name: 'BNB', price: 589.23, change: -0.45, volume: '234M', marketCap: '90B' },
  { symbol: 'SOL', name: 'Solana', price: 145.67, change: 4.21, volume: '567M', marketCap: '65B' },
  { symbol: 'XRP', name: 'Ripple', price: 0.6234, change: -1.23, volume: '345M', marketCap: '34B' },
  { symbol: 'ADA', name: 'Cardano', price: 0.4567, change: 0.89, volume: '189M', marketCap: '16B' },
  { symbol: 'AVAX', name: 'Avalanche', price: 38.45, change: 3.12, volume: '123M', marketCap: '14B' },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.0823, change: -2.34, volume: '278M', marketCap: '11B' },
];

interface MarketData extends Symbol {
  displayVolume: string;
  displayMarketCap: string;
}

function formatVolume(vol: number): string {
  if (vol >= 1e9) return (vol / 1e9).toFixed(2) + 'B';
  if (vol >= 1e6) return (vol / 1e6).toFixed(2) + 'M';
  if (vol >= 1e3) return (vol / 1e3).toFixed(2) + 'K';
  return vol.toFixed(2);
}

function formatMarketCap(cap?: number): string {
  if (!cap) return '-';
  if (cap >= 1e12) return (cap / 1e12).toFixed(1) + 'T';
  if (cap >= 1e9) return (cap / 1e9).toFixed(0) + 'B';
  if (cap >= 1e6) return (cap / 1e6).toFixed(0) + 'M';
  return cap.toString();
}

export function Markets() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('spot');
  const [searchQuery, setSearchQuery] = useState('');
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch market data from API
  useEffect(() => {
    async function fetchMarkets() {
      setLoading(true);
      setError(null);
      
      const result = await marketApi.getSymbols();
      
      if (result.error) {
        console.error('Failed to fetch markets:', result.error);
        // Fallback to mock data on error
        setMarkets(MOCK_MARKETS.map(m => ({
          ...m,
          symbol: m.symbol + 'USDT',
          change_24h: m.change,
          volume_24h: parseFloat(m.volume.replace('B', '').replace('M', '')) * 1e6,
          displayVolume: m.volume,
          displayMarketCap: m.marketCap,
        })));
      } else if (result.data) {
        setMarkets(result.data.map((m: Symbol) => ({
          ...m,
          change: m.change_24h,
          displayVolume: formatVolume(m.volume_24h),
          displayMarketCap: formatMarketCap(m.market_cap),
        })));
      }
      
      setLoading(false);
    }
    
    fetchMarkets();
  }, []);

  const filteredMarkets = markets.filter(m => 
    m.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by change for gainers
  const gainers = [...filteredMarkets].sort((a, b) => b.change_24h - a.change_24h).slice(0, 3);
  const topVolume = [...filteredMarkets].sort((a, b) => b.volume_24h - a.volume_24h).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">市场总览</h1>
        <p className="text-gray-400">实时追踪全球加密货币价格、成交量与市值</p>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139]">
          <h3 className="text-gray-400 font-medium mb-4 flex items-center gap-2">
            <TrendingUp className="text-[#0ecb81] w-5 h-5" /> 热门币种
          </h3>
          <div className="space-y-4">
            {gainers.map(coin => (
              <div key={coin.symbol} className="flex justify-between items-center cursor-pointer hover:bg-[#2b3139] p-2 -mx-2 rounded transition-colors" onClick={() => navigate('/trade')}>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#f0b90b] rounded-full flex items-center justify-center text-xs font-bold text-black">
                    {coin.symbol.replace('USDT', '')[0]}
                  </div>
                  <span className="font-medium text-white">{coin.symbol.replace('USDT', '')}</span>
                </div>
                <div className={`text-sm ${coin.change_24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                  {coin.change_24h > 0 ? '+' : ''}{coin.change_24h?.toFixed(2) ?? '0.00'}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139]">
          <h3 className="text-gray-400 font-medium mb-4 flex items-center gap-2">
            🚀 涨幅榜
          </h3>
          <div className="space-y-4">
            {[...MOCK_MARKETS].sort((a, b) => b.change - a.change).slice(0, 3).map(coin => (
              <div key={coin.symbol} className="flex justify-between items-center cursor-pointer hover:bg-[#2b3139] p-2 -mx-2 rounded transition-colors" onClick={() => navigate('/trade')}>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-white">{coin.symbol}</span>
                </div>
                <div className="text-sm text-[#0ecb81]">
                  +{coin.change}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139]">
          <h3 className="text-gray-400 font-medium mb-4 flex items-center gap-2">
            🔥 成交量榜
          </h3>
          <div className="space-y-4">
            {topVolume.map(coin => (
              <div key={coin.symbol} className="flex justify-between items-center cursor-pointer hover:bg-[#2b3139] p-2 -mx-2 rounded transition-colors" onClick={() => navigate('/trade')}>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-white">{coin.symbol.replace('USDT', '')}</span>
                </div>
                <div className="text-sm text-gray-300">
                  ${coin.displayVolume}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#1e2329] rounded-xl border border-[#2b3139] overflow-hidden">
        <div className="p-4 border-b border-[#2b3139] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-6 text-sm">
            <button 
              className={`pb-4 -mb-4 border-b-2 font-medium ${activeTab === 'favorites' ? 'border-[#f0b90b] text-[#f0b90b]' : 'border-transparent text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('favorites')}
            >
              自选
            </button>
            <button 
              className={`pb-4 -mb-4 border-b-2 font-medium ${activeTab === 'spot' ? 'border-[#f0b90b] text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('spot')}
            >
              现货市场
            </button>
            <button 
              className={`pb-4 -mb-4 border-b-2 font-medium ${activeTab === 'futures' ? 'border-[#f0b90b] text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('futures')}
            >
              合约市场
            </button>
          </div>
          
          <div className="flex items-center bg-[#0b0e11] rounded px-3 py-2 gap-2 w-full md:w-64 border border-[#2b3139] focus-within:border-[#f0b90b] transition-colors">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索币种"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-white w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 bg-[#161a1e] border-b border-[#2b3139]">
              <tr>
                <th className="px-6 py-4 font-normal">交易对</th>
                <th className="px-6 py-4 font-normal text-right">最新价</th>
                <th className="px-6 py-4 font-normal text-right">24h 涨跌</th>
                <th className="px-6 py-4 font-normal text-right hidden md:table-cell">24h 最高</th>
                <th className="px-6 py-4 font-normal text-right hidden md:table-cell">24h 最低</th>
                <th className="px-6 py-4 font-normal text-right hidden sm:table-cell">24h 成交额</th>
                <th className="px-6 py-4 font-normal text-right hidden lg:table-cell">市值</th>
                <th className="px-6 py-4 font-normal text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    数据加载失败，使用离线数据
                  </td>
                </tr>
              ) : filteredMarkets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    未找到匹配的币种
                  </td>
                </tr>
              ) : (
                filteredMarkets.map((coin) => (
                  <tr key={coin.symbol} className="hover:bg-[#2b3139] border-b border-[#2b3139]/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Star className="w-4 h-4 text-gray-500 hover:text-[#f0b90b] cursor-pointer transition-colors" />
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#f0b90b] rounded-full flex items-center justify-center text-xs font-bold text-black">
                            {coin.symbol.replace('USDT', '')[0]}
                          </div>
                          <div>
                            <span className="font-bold text-white text-base">{coin.symbol.replace('USDT', '')}</span>
                            <span className="text-gray-500 ml-1 text-xs">{coin.name || 'USDT'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-white">
                      ${coin.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) || '0.00'}
                    </td>
                    <td className={`px-6 py-4 text-right font-medium ${coin.change_24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                      {coin.change_24h > 0 ? '+' : ''}{coin.change_24h?.toFixed(2) ?? '0.00'}%
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300 hidden md:table-cell">
                      ${coin.high_24h?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) || '0.00'}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300 hidden md:table-cell">
                      ${coin.low_24h?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) || '0.00'}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300 hidden sm:table-cell">
                      ${coin.displayVolume || '0'}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300 hidden lg:table-cell">
                      ${coin.displayMarketCap || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => navigate('/trade')}
                        className="text-[#f0b90b] hover:text-[#f0b90b]/80 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 mx-auto"
                      >
                        去交易 <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {filteredMarkets.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              未找到匹配的币种
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
