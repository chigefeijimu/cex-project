import { useState, useEffect } from 'react';
import { ArrowDownUp, CreditCard, Wallet, ShieldCheck, Loader2 } from 'lucide-react';
import { buyCryptoApi, type FiatPrice, type PaymentMethod, type BuyOrder } from '../services/api';

const CRYPTO_OPTIONS = ['BTC', 'ETH', 'USDT', 'SOL', 'BNB'];
const FIAT_OPTIONS = ['USD', 'EUR', 'GBP'];

export function BuyCrypto() {
  const [spendAmount, setSpendAmount] = useState('100');
  const [spendCurrency, setSpendCurrency] = useState('USD');
  const [receiveCurrency, setReceiveCurrency] = useState('BTC');
  const [fiatPrices, setFiatPrices] = useState<FiatPrice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState<BuyOrder[]>([]);
  const [showOrders, setShowOrders] = useState(false);

  const btcPrice = fiatPrices.find(p => p.crypto === receiveCurrency && p.fiat === spendCurrency)?.fiat_price || 65432.50;
  const receiveAmount = (parseFloat(spendAmount || '0') / btcPrice).toFixed(6);

  useEffect(() => {
    async function fetchData() {
      const [pricesResult, methodsResult, ordersResult] = await Promise.all([
        buyCryptoApi.getFiatPrice(spendCurrency, receiveCurrency),
        buyCryptoApi.getPaymentMethods(),
        buyCryptoApi.getOrders(),
      ]);
      
      if (pricesResult.data) setFiatPrices(pricesResult.data);
      if (methodsResult.data) {
        setPaymentMethods(methodsResult.data);
        if (methodsResult.data.length > 0) setSelectedPayment(methodsResult.data[0].id);
      }
      if (ordersResult.data) setOrders(ordersResult.data);
      setLoading(false);
    }
    fetchData();
  }, [spendCurrency, receiveCurrency]);

  const handleCreateOrder = async () => {
    setSubmitting(true);
    const result = await buyCryptoApi.createOrder(spendCurrency, receiveCurrency, parseFloat(spendAmount), selectedPayment);
    
    if (result.data) {
      setOrders(prev => [result.data as BuyOrder, ...prev]);
      setSpendAmount('100');
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-4">一键买币</h1>
        <p className="text-gray-400">支持信用卡/借记卡、银行转账和第三方支付</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-4xl">
        {/* Left Side: Features */}
        <div className="hidden lg:flex flex-col justify-center space-y-8">
          <div className="flex items-start gap-4">
            <div className="bg-[#1e2329] p-3 rounded-full">
              <ShieldCheck className="w-6 h-6 text-[#f0b90b]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">安全可靠</h3>
              <p className="text-gray-400 text-sm">世界顶级的风险控制系统，保障您的资金安全</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-[#1e2329] p-3 rounded-full">
              <CreditCard className="w-6 h-6 text-[#f0b90b]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">多种支付方式</h3>
              <p className="text-gray-400 text-sm">支持Visa、Mastercard等多种主流支付渠道</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-[#1e2329] p-3 rounded-full">
              <Wallet className="w-6 h-6 text-[#f0b90b]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">极速到账</h3>
              <p className="text-gray-400 text-sm">支付成功后，加密货币将立即存入您的账户</p>
            </div>
          </div>
        </div>

        {/* Right Side: Buy Form */}
        <div className="bg-[#1e2329] border border-[#2b3139] rounded-2xl p-6 shadow-xl">
          <div className="flex gap-4 border-b border-[#2b3139] mb-6 pb-2">
            <button className="text-white font-bold pb-2 border-b-2 border-[#f0b90b]">买入</button>
            <button className="text-gray-400 font-bold pb-2 border-b-2 border-transparent hover:text-white">卖出</button>
          </div>

          <div className="space-y-4">
            {/* Spend Input */}
            <div className="bg-[#0b0e11] border border-[#2b3139] rounded-xl p-4 hover:border-[#f0b90b] transition-colors focus-within:border-[#f0b90b]">
              <div className="text-xs text-gray-500 mb-2 flex justify-between">
                <span>我支付</span>
                <span>单笔限额: 15.00 - 20,000.00 USD</span>
              </div>
              <div className="flex justify-between items-center">
                <input 
                  type="number" 
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                  className="bg-transparent text-2xl font-bold text-white outline-none w-2/3"
                  placeholder="0.00"
                />
                <button className="flex items-center gap-2 bg-[#2b3139] px-3 py-1.5 rounded-lg hover:bg-[#3b434c] transition-colors text-white font-medium">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold">$</div>
                  {spendCurrency}
                </button>
              </div>
            </div>

            <div className="flex justify-center -my-2 relative z-10">
              <div className="bg-[#2b3139] p-1.5 rounded-full border border-[#1e2329] hover:bg-[#3b434c] cursor-pointer transition-colors">
                <ArrowDownUp className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Receive Input */}
            <div className="bg-[#0b0e11] border border-[#2b3139] rounded-xl p-4 hover:border-[#f0b90b] transition-colors">
              <div className="text-xs text-gray-500 mb-2">我收到 (预估)</div>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-gray-300 w-2/3 truncate">
                  {receiveAmount}
                </div>
                <button className="flex items-center gap-2 bg-[#2b3139] px-3 py-1.5 rounded-lg hover:bg-[#3b434c] transition-colors text-white font-medium">
                  <div className="w-5 h-5 bg-[#f0b90b] rounded-full flex items-center justify-center text-[10px] font-bold text-black">B</div>
                  {receiveCurrency}
                </button>
              </div>
            </div>

            {/* Price Info */}
            <div className="flex justify-between text-sm py-2">
              <span className="text-gray-500">参考价格</span>
              <span className="text-gray-300">1 {receiveCurrency} ≈ {btcPrice.toLocaleString()} {spendCurrency}</span>
            </div>

            {/* Payment Method */}
            <div className="border border-[#2b3139] rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-2">支付方式</div>
              {loading ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> 加载中...
                </div>
              ) : (
                <div className="space-y-2">
                  {paymentMethods.map(method => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedPayment === method.id 
                          ? 'bg-[#f0b90b]/20 border border-[#f0b90b]' 
                          : 'bg-[#0b0e11] hover:bg-[#2b3139]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className={`w-5 h-5 ${selectedPayment === method.id ? 'text-[#f0b90b]' : 'text-gray-400'}`} />
                        <div>
                          <div className="text-white font-medium">{method.name}</div>
                          {method.processing_time && (
                            <div className="text-xs text-gray-500">{method.processing_time}</div>
                          )}
                        </div>
                      </div>
                      {selectedPayment === method.id && (
                        <div className="w-4 h-4 rounded-full bg-[#f0b90b] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-black" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button 
              onClick={handleCreateOrder}
              disabled={submitting || loading || !selectedPayment}
              className="w-full bg-[#f0b90b] text-black font-bold py-4 rounded-xl hover:bg-[#f0b90b]/90 transition-colors mt-4 text-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> 处理中...
                </>
              ) : (
                `买入 ${receiveCurrency}`
              )}
            </button>
          </div>
        </div>

        {/* Order History Toggle */}
        {orders.length > 0 && (
          <div className="mt-6 text-center">
            <button 
              onClick={() => setShowOrders(!showOrders)}
              className="text-[#f0b90b] hover:underline text-sm"
            >
              {showOrders ? '隐藏' : '查看'}订单历史 ({orders.length})
            </button>
            {showOrders && (
              <div className="mt-4 bg-[#1e2329] rounded-xl border border-[#2b3139] p-4 text-left">
                <h4 className="text-white font-bold mb-3">订单历史</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {orders.map(order => (
                    <div key={order.id} className="flex justify-between text-sm p-2 bg-[#0b0e11] rounded">
                      <span className="text-white">{order.crypto} {order.fiat}</span>
                      <span className="text-gray-400">{order.amount} @ {order.price}</span>
                      <span className={`${order.status === 'completed' ? 'text-[#0ecb81]' : 'text-[#f0b90b]'}`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
