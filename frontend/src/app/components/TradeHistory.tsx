import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface Trade {
  id: number;
  price: number;
  amount: number;
  time: string;
  type: 'buy' | 'sell';
}

const generateInitialTrades = (): Trade[] => {
  const trades: Trade[] = [];
  let price = 65400;
  
  for (let i = 0; i < 20; i++) {
    const type = Math.random() > 0.5 ? 'buy' : 'sell';
    price += (Math.random() - 0.5) * 50;
    trades.push({
      id: i,
      price: Math.round(price * 100) / 100,
      amount: Math.round(Math.random() * 2 * 1000) / 1000,
      time: new Date(Date.now() - i * 30000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }),
      type,
    });
  }
  
  return trades;
};

export function TradeHistory() {
  const [trades, setTrades] = useState<Trade[]>(generateInitialTrades());

  useEffect(() => {
    const interval = setInterval(() => {
      const type = Math.random() > 0.5 ? 'buy' : 'sell';
      const lastPrice = trades[0]?.price || 65400;
      const newPrice = Math.round((lastPrice + (Math.random() - 0.5) * 50) * 100) / 100;
      
      const newTrade: Trade = {
        id: Date.now(),
        price: newPrice,
        amount: Math.round(Math.random() * 2 * 1000) / 1000,
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        }),
        type,
      };
      
      setTrades(prev => [newTrade, ...prev.slice(0, 19)]);
    }, 5000);

    return () => clearInterval(interval);
  }, [trades]);

  return (
    <div className="bg-[#161a1e] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-gray-400" />
        <h2 className="text-lg font-semibold">Market Trades</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-[#2b3139]">
              <th className="text-left py-2 px-4">Price(USDT)</th>
              <th className="text-right py-2 px-4">Amount(BTC)</th>
              <th className="text-right py-2 px-4">Time</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr 
                key={trade.id}
                className="border-b border-[#2b3139]/50 hover:bg-[#1e2329] transition-colors"
              >
                <td className={`py-2 px-4 ${trade.type === 'buy' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                  {trade.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="text-right py-2 px-4 text-white">
                  {trade.amount.toFixed(4)}
                </td>
                <td className="text-right py-2 px-4 text-gray-400">
                  {trade.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
