import { useState } from 'react';
import { ArrowDownUp, CreditCard, Wallet, ShieldCheck } from 'lucide-react';

export function BuyCrypto() {
  const [spendAmount, setSpendAmount] = useState('100');
  const [spendCurrency, setSpendCurrency] = useState('USD');
  const [receiveCurrency, setReceiveCurrency] = useState('BTC');

  const btcPrice = 65432.50;
  const receiveAmount = (parseFloat(spendAmount || '0') / btcPrice).toFixed(6);

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
            <div className="border border-[#2b3139] rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#2b3139]/50 transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-gray-400" />
                <div>
                  <div className="text-white font-medium">信用卡/借记卡</div>
                  <div className="text-xs text-[#0ecb81]">免手续费优惠</div>
                </div>
              </div>
              <div className="text-gray-500 hover:text-white">更改 &gt;</div>
            </div>

            {/* Submit */}
            <button className="w-full bg-[#f0b90b] text-black font-bold py-4 rounded-xl hover:bg-[#f0b90b]/90 transition-colors mt-4 text-lg">
              买入 {receiveCurrency}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
