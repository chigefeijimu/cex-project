import { Wallet } from 'lucide-react';

interface AssetBalanceProps {
  balances: {
    BTC: number;
    USDT: number;
  };
}

export function AssetBalance({ balances }: AssetBalanceProps) {
  return (
    <div className="bg-[#161a1e] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-gray-400" />
        <h2 className="text-lg font-semibold">Assets</h2>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-[#1e2329] rounded">
          <div>
            <div className="text-sm text-gray-400">BTC</div>
            <div className="text-lg font-semibold">{balances.BTC.toFixed(4)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">≈ USDT</div>
            <div className="text-sm">{(balances.BTC * 65432.50).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-[#1e2329] rounded">
          <div>
            <div className="text-sm text-gray-400">USDT</div>
            <div className="text-lg font-semibold">{balances.USDT.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">≈ BTC</div>
            <div className="text-sm">{(balances.USDT / 65432.50).toFixed(4)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
