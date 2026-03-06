import { PiggyBank, ShieldCheck, Flame, Coins, ArrowRight } from 'lucide-react';

const MOCK_EARN_PRODUCTS = [
  { symbol: 'USDT', name: 'Tether US', apr: '12.50%', duration: '活期', type: '赚币', tag: '热门' },
  { symbol: 'USDC', name: 'USD Coin', apr: '10.20%', duration: '活期', type: '赚币' },
  { symbol: 'BTC', name: 'Bitcoin', apr: '2.50%', duration: '活期', type: '赚币' },
  { symbol: 'ETH', name: 'Ethereum', apr: '4.20%', duration: '120天', type: '质押', tag: '高收益' },
  { symbol: 'SOL', name: 'Solana', apr: '6.80%', duration: '60天', type: '质押' },
  { symbol: 'BNB', name: 'BNB', apr: '3.50%', duration: '活期', type: '收益池' },
];

export function Earn() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12 py-10 bg-gradient-to-b from-[#1e2329] to-transparent rounded-3xl border border-[#2b3139]/50">
        <h1 className="text-4xl font-bold text-white mb-4">币安理财</h1>
        <p className="text-gray-400 text-lg mb-8">一站式加密货币投资平台，让您的闲置数字资产轻松赚取收益</p>
        
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 px-4">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">$3.5B+</div>
            <div className="text-xs sm:text-sm text-gray-500">累计发放收益</div>
          </div>
          <div className="w-px bg-[#2b3139] hidden sm:block"></div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">300+</div>
            <div className="text-xs sm:text-sm text-gray-500">支持币种</div>
          </div>
          <div className="w-px bg-[#2b3139] hidden sm:block"></div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">100%</div>
            <div className="text-xs sm:text-sm text-gray-500">本金保障(赚币)</div>
          </div>
        </div>
      </div>

      {/* Product Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#1e2329] border border-[#2b3139] p-6 rounded-2xl hover:border-[#f0b90b] transition-colors cursor-pointer group">
          <div className="bg-[#2b3139] w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#f0b90b]/20 transition-colors">
            <PiggyBank className="w-6 h-6 text-[#f0b90b]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">赚币</h3>
          <p className="text-gray-400 text-sm mb-4">随存随取，零手续费，适合寻求稳定收益的用户。</p>
          <div className="text-[#f0b90b] text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            了解更多 <ArrowRight className="w-4 h-4" />
          </div>
        </div>
        
        <div className="bg-[#1e2329] border border-[#2b3139] p-6 rounded-2xl hover:border-[#f0b90b] transition-colors cursor-pointer group">
          <div className="bg-[#2b3139] w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#f0b90b]/20 transition-colors">
            <ShieldCheck className="w-6 h-6 text-[#f0b90b]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">ETH 质押</h3>
          <p className="text-gray-400 text-sm mb-4">参与以太坊网络共识，获得稳定质押奖励。</p>
          <div className="text-[#f0b90b] text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            了解更多 <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#1e2329] border border-[#2b3139] p-6 rounded-2xl hover:border-[#f0b90b] transition-colors cursor-pointer group">
          <div className="bg-[#2b3139] w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#f0b90b]/20 transition-colors">
            <Coins className="w-6 h-6 text-[#f0b90b]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">双币投资</h3>
          <p className="text-gray-400 text-sm mb-4">高收益的结构化产品，适合震荡行情。</p>
          <div className="text-[#f0b90b] text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            了解更多 <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Earn Products Table */}
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Flame className="w-6 h-6 text-[#f0b90b]" /> 热门理财产品
      </h2>
      
      <div className="bg-[#1e2329] rounded-xl border border-[#2b3139] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 bg-[#161a1e] border-b border-[#2b3139]">
              <tr>
                <th className="px-6 py-4 font-normal">币种</th>
                <th className="px-6 py-4 font-normal text-right">参考年化(APR)</th>
                <th className="px-6 py-4 font-normal text-right">期限</th>
                <th className="px-6 py-4 font-normal text-center hidden sm:table-cell">产品类型</th>
                <th className="px-6 py-4 font-normal text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_EARN_PRODUCTS.map((product) => (
                <tr key={product.symbol} className="hover:bg-[#2b3139] border-b border-[#2b3139]/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#f0b90b] rounded-full flex items-center justify-center text-sm font-bold text-black shrink-0">
                        {product.symbol[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">{product.symbol}</span>
                          {product.tag && (
                            <span className="text-[10px] bg-[#f0b90b]/20 text-[#f0b90b] px-1.5 py-0.5 rounded border border-[#f0b90b]/30">
                              {product.tag}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{product.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xl font-bold text-[#0ecb81]">{product.apr}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-white">
                    {product.duration}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-300 hidden sm:table-cell">
                    {product.type}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="bg-[#f0b90b] text-black hover:bg-[#f0b90b]/90 px-4 sm:px-6 py-2 rounded-lg font-bold transition-colors text-xs sm:text-sm">
                      申购
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
