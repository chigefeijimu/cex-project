import { Info } from 'lucide-react';
import { useNavigate } from 'react-router';

const MOCK_FUTURES = [
  { symbol: 'BTCUSDT', name: '永续', price: 65432.50, change: 2.34, volume: '15.2B', fundingRate: '0.0100%' },
  { symbol: 'ETHUSDT', name: '永续', price: 3234.67, change: 1.89, volume: '8.9B', fundingRate: '0.0100%' },
  { symbol: 'SOLUSDT', name: '永续', price: 145.67, change: 4.21, volume: '5.6B', fundingRate: '0.0125%' },
  { symbol: 'BNBUSDT', name: '永续', price: 589.23, change: -0.45, volume: '2.3B', fundingRate: '0.0080%' },
  { symbol: 'DOGEUSDT', name: '永续', price: 0.0823, change: -2.34, volume: '1.2B', fundingRate: '-0.0050%' },
];

export function Derivatives() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-[#1e2329] border border-[#2b3139] rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center justify-between overflow-hidden relative">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-block bg-[#2b3139] text-[#f0b90b] text-xs font-bold px-3 py-1 rounded-full mb-4 border border-[#f0b90b]/30">
            最高 125x 杠杆
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">加密货币衍生品交易平台</h1>
          <p className="text-gray-400 mb-8 text-lg">
            全球领先的数字资产合约交易平台。通过做多或做空加密货币，在任何市场环境下获利。
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => navigate('/trade')} className="bg-[#f0b90b] text-black font-bold px-8 py-3 rounded-lg hover:bg-[#f0b90b]/90 transition-colors">
              立即交易 U本位合约
            </button>
            <button className="bg-[#2b3139] text-white font-bold px-8 py-3 rounded-lg hover:bg-[#3b434c] transition-colors">
              开通合约账户
            </button>
          </div>
        </div>
        
        <div className="hidden md:flex flex-col gap-4 relative z-10 mt-8 md:mt-0">
           {/* Decorative elements representing charts/trading */}
           <div className="bg-[#2b3139]/80 backdrop-blur-md border border-[#3b434c] p-4 rounded-xl w-64 shadow-2xl transform translate-x-4">
              <div className="text-gray-400 text-sm mb-1">BTCUSDT 永续</div>
              <div className="text-2xl font-bold text-[#0ecb81]">+2.34%</div>
           </div>
           <div className="bg-[#2b3139]/80 backdrop-blur-md border border-[#3b434c] p-4 rounded-xl w-64 shadow-2xl transform -translate-x-4">
              <div className="text-gray-400 text-sm mb-1">ETHUSDT 永续</div>
              <div className="text-2xl font-bold text-[#0ecb81]">+1.89%</div>
           </div>
        </div>
      </div>

      {/* Market Data */}
      <h2 className="text-2xl font-bold text-white mb-6">热门 U本位合约</h2>
      <div className="bg-[#1e2329] rounded-xl border border-[#2b3139] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 bg-[#161a1e] border-b border-[#2b3139]">
              <tr>
                <th className="px-6 py-4 font-normal">交易对</th>
                <th className="px-6 py-4 font-normal text-right">最新价</th>
                <th className="px-6 py-4 font-normal text-right">24h 涨跌</th>
                <th className="px-6 py-4 font-normal text-right hidden sm:table-cell">24h 成交额(USDT)</th>
                <th className="px-6 py-4 font-normal text-right hidden md:table-cell">
                  <div className="flex items-center justify-end gap-1">
                    资金费率 <Info className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-4 font-normal text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_FUTURES.map((coin) => (
                <tr key={coin.symbol} className="hover:bg-[#2b3139] border-b border-[#2b3139]/50 transition-colors group cursor-pointer" onClick={() => navigate('/trade')}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{coin.symbol}</span>
                      <span className="text-[10px] bg-[#2b3139] text-[#f0b90b] px-1.5 py-0.5 rounded border border-[#f0b90b]/30">{coin.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-white">
                    {coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </td>
                  <td className={`px-6 py-4 text-right font-medium ${coin.change >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                    {coin.change > 0 ? '+' : ''}{coin.change}%
                  </td>
                  <td className="px-6 py-4 text-right text-white hidden sm:table-cell">
                    {coin.volume}
                  </td>
                  <td className="px-6 py-4 text-right text-[#f0b90b] hidden md:table-cell">
                    {coin.fundingRate}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      className="text-white bg-[#2b3139] hover:bg-[#3b434c] px-4 py-1.5 rounded text-xs font-medium transition-colors"
                      onClick={(e) => { e.stopPropagation(); navigate('/trade'); }}
                    >
                      交易
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
