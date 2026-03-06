import { useState, useEffect } from 'react';
import { PiggyBank, ShieldCheck, Flame, Coins, ArrowRight, Loader2 } from 'lucide-react';
import { earnApi, type EarnProduct, type EarnHolding } from '../services/api';

export function Earn() {
  const [products, setProducts] = useState<EarnProduct[]>([]);
  const [holdings, setHoldings] = useState<EarnHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [subscribeAmount, setSubscribeAmount] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [productsResult, holdingsResult] = await Promise.all([
        earnApi.getProducts(),
        earnApi.getHoldings(),
      ]);
      
      if (productsResult.data) {
        setProducts(productsResult.data);
      }
      if (holdingsResult.data) {
        setHoldings(holdingsResult.data);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleSubscribe = async (productId: string) => {
    const amount = parseFloat(subscribeAmount[productId]);
    if (!amount || amount <= 0) return;
    
    setSubscribing(productId);
    const result = await earnApi.subscribe(productId, amount);
    
    if (result.data) {
      setHoldings(prev => [...prev, result.data as EarnHolding]);
      setSubscribeAmount(prev => ({ ...prev, [productId]: '' }));
      setShowModal(null);
    }
    setSubscribing(null);
  };

  const getProductTag = (product: EarnProduct) => {
    if (product.duration === '活期') return '热门';
    if (product.apr > 8) return '高收益';
    return null;
  };

  const getDuration = (product: EarnProduct) => {
    if (product.duration === '0' || product.lock_period === 0) return '活期';
    return product.duration || `${product.lock_period}天`;
  };

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
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    加载中...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    暂无可用理财产品
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-[#2b3139] border-b border-[#2b3139]/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#f0b90b] rounded-full flex items-center justify-center text-sm font-bold text-black shrink-0">
                          {product.symbol[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">{product.symbol}</span>
                            {getProductTag(product) && (
                              <span className="text-[10px] bg-[#f0b90b]/20 text-[#f0b90b] px-1.5 py-0.5 rounded border border-[#f0b90b]/30">
                                {getProductTag(product)}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{product.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xl font-bold text-[#0ecb81]">{(product.apr * 100).toFixed(2)}%</span>
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      {getDuration(product)}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-300 hidden sm:table-cell">
                      {product.product_type || '赚币'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setShowModal(product.id)}
                        className="bg-[#f0b90b] text-black hover:bg-[#f0b90b]/90 px-4 sm:px-6 py-2 rounded-lg font-bold transition-colors text-xs sm:text-sm"
                      >
                        申购
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Subscribe Modal */}
      {showModal && (() => {
        const product = products.find(p => p.id === showModal);
        if (!product) return null;
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(null)}>
            <div className="bg-[#1e2329] border border-[#2b3139] rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-white mb-4">申购 {product.symbol}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-2">申购金额</label>
                  <input
                    type="number"
                    value={subscribeAmount[showModal] || ''}
                    onChange={e => setSubscribeAmount(prev => ({ ...prev, [showModal]: e.target.value }))}
                    placeholder={`最低 ${product.min_amount} ${product.symbol}`}
                    className="w-full bg-[#0b0e11] border border-[#2b3139] rounded-xl px-4 py-3 text-white outline-none focus:border-[#f0b90b]"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>预计年化收益</span>
                  <span className="text-[#0ecb81] font-bold">{(product.apr * 100).toFixed(2)}%</span>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(null)}
                    className="flex-1 bg-[#2b3139] text-white font-bold py-3 rounded-xl hover:bg-[#3b434c] transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => handleSubscribe(showModal)}
                    disabled={subscribing === showModal}
                    className="flex-1 bg-[#f0b90b] text-black font-bold py-3 rounded-xl hover:bg-[#f0b90b]/90 transition-colors disabled:opacity-50"
                  >
                    {subscribing === showModal ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : '确认申购'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
