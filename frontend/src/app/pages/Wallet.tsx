import { useState, useEffect } from 'react';
import { Eye, EyeOff, Plus, ArrowRight, ArrowDownToLine, ArrowUpFromLine, History } from 'lucide-react';
import { useNavigate } from 'react-router';
import { walletApi, marketApi, type Balance, type Symbol } from '../services/api';

export function Wallet() {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [btcPrice, setBtcPrice] = useState(65432.50);

  // Fetch wallet data from API
  useEffect(() => {
    async function fetchWalletData() {
      setLoading(true);
      
      // Fetch balances - use default user for demo
      const balanceResult = await walletApi.getBalance("default");
      if (balanceResult.data) {
        setBalances(balanceResult.data);
      }
      
      // Fetch BTC price for valuation
      const tickerResult = await marketApi.getTicker('BTC/USDT');
      if (tickerResult.data) {
        setBtcPrice(tickerResult.data.price);
      }
      
      setLoading(false);
    }
    
    fetchWalletData();
  }, []);

  // Calculate total balance in USDT
  const totalBalance = balances.reduce((sum, b) => sum + b.available + b.frozen, 0);
  const todayPnL = +124.50;

  // Map API balances to display format
  const assets = balances.map((b) => ({
    symbol: b.currency,
    name: b.currency === 'USDT' ? 'Tether US' : b.currency === 'BTC' ? 'Bitcoin' : b.currency === 'ETH' ? 'Ethereum' : b.currency,
    balance: b.total,
    available: b.available,
    inOrder: b.frozen,
    btcValue: b.currency === 'USDT' ? b.total / btcPrice : b.total,
  }));

  const formatCrypto = (val: number) => {
    if (!showBalance) return '********';
    return val.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 8 });
  };

  const formatFiat = (val: number) => {
    if (!showBalance) return '********';
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 shrink-0">
        <div className="bg-[#1e2329] rounded-xl border border-[#2b3139] p-2">
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 px-4 pt-2">资金概览</div>
          <button className="w-full text-left px-4 py-3 bg-[#2b3139] text-white rounded-lg font-medium transition-colors">
            现货账户
          </button>
          <button className="w-full text-left px-4 py-3 text-gray-400 hover:bg-[#2b3139]/50 hover:text-white rounded-lg transition-colors mt-1">
            资金账户
          </button>
          <button className="w-full text-left px-4 py-3 text-gray-400 hover:bg-[#2b3139]/50 hover:text-white rounded-lg transition-colors mt-1">
            理财账户
          </button>
          <button className="w-full text-left px-4 py-3 text-gray-400 hover:bg-[#2b3139]/50 hover:text-white rounded-lg transition-colors mt-1">
            合约账户
          </button>
          
          <div className="my-4 border-t border-[#2b3139]"></div>
          
          <button className="w-full text-left px-4 py-3 text-gray-400 hover:bg-[#2b3139]/50 hover:text-white rounded-lg transition-colors flex items-center gap-2">
            <History className="w-4 h-4" />
            账单流水
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Balance Overview */}
        <div className="bg-[#1e2329] rounded-xl border border-[#2b3139] p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-white">现货账户</h2>
            <button onClick={() => setShowBalance(!showBalance)} className="text-gray-400 hover:text-white transition-colors">
              {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div>
              <div className="text-gray-400 text-sm mb-1">总资产折合</div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-white">
                  {showBalance ? totalBalance.toLocaleString() : '********'} 
                  <span className="text-xl font-normal ml-2">USDT</span>
                </span>
                <span className="text-gray-500">
                  ≈ {showBalance ? (totalBalance / 65432.50).toLocaleString(undefined, { minimumFractionDigits: 8 }) : '********'} BTC
                </span>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-gray-400">今日盈亏 </span>
                <span className={todayPnL >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}>
                  {showBalance ? `${todayPnL > 0 ? '+' : ''}$${Math.abs(todayPnL).toLocaleString()}` : '********'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button className="px-6 py-2.5 bg-[#f0b90b] text-black font-semibold rounded-lg hover:bg-[#f0b90b]/90 transition-colors flex items-center gap-2">
                <ArrowDownToLine className="w-4 h-4" /> 充值
              </button>
              <button className="px-6 py-2.5 bg-[#2b3139] text-white font-semibold rounded-lg hover:bg-[#2b3139]/80 transition-colors flex items-center gap-2">
                <ArrowUpFromLine className="w-4 h-4" /> 提现
              </button>
              <button className="px-6 py-2.5 bg-[#2b3139] text-white font-semibold rounded-lg hover:bg-[#2b3139]/80 transition-colors flex items-center gap-2">
                <ArrowRight className="w-4 h-4" /> 划转
              </button>
            </div>
          </div>
        </div>

        {/* Assets List */}
        <div className="bg-[#1e2329] rounded-xl border border-[#2b3139] overflow-hidden">
          <div className="p-4 border-b border-[#2b3139] flex justify-between items-center">
            <h3 className="text-white font-medium text-lg">资产列表</h3>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="hide-small" className="accent-[#f0b90b] bg-[#0b0e11] border-[#2b3139]" />
              <label htmlFor="hide-small" className="text-sm text-gray-400 cursor-pointer">隐藏小额资产</label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="text-xs text-gray-500 bg-[#161a1e] border-b border-[#2b3139]">
                <tr>
                  <th className="px-6 py-4 font-normal">币种</th>
                  <th className="px-6 py-4 font-normal text-right">总额</th>
                  <th className="px-6 py-4 font-normal text-right">可用</th>
                  <th className="px-6 py-4 font-normal text-right hidden sm:table-cell">冻结</th>
                  <th className="px-6 py-4 font-normal text-right hidden md:table-cell">BTC 估值</th>
                  <th className="px-6 py-4 font-normal text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      加载中...
                    </td>
                  </tr>
                ) : (assets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      暂无资产数据
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => (
                  <tr key={asset.symbol} className="hover:bg-[#2b3139] border-b border-[#2b3139]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-[#f0b90b] rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0">
                          {asset.symbol[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white">{asset.symbol}</div>
                          <div className="text-xs text-gray-500">{asset.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-white">
                      {formatCrypto(asset.balance)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300">
                      {formatCrypto(asset.available)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300 hidden sm:table-cell">
                      {formatCrypto(asset.inOrder)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300 hidden md:table-cell">
                      {formatCrypto(asset.btcValue)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3 font-medium">
                        <button className="text-[#f0b90b] hover:text-[#f0b90b]/80">充值</button>
                        <button className="text-white hover:text-gray-300">提现</button>
                        <button onClick={() => navigate('/trade')} className="text-white hover:text-gray-300">交易</button>
                      </div>
                    </td>
                  </tr>
                ))))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
