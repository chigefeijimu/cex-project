import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

interface Order {
  price: number;
  amount: number;
  total: number;
}

const generateOrders = (basePrice: number, type: 'buy' | 'sell'): Order[] => {
  const orders: Order[] = [];
  for (let i = 0; i < 15; i++) {
    const priceOffset = type === 'buy' ? -i * 10 - 5 : i * 10 + 5;
    const price = Math.round((basePrice + priceOffset) * 100) / 100;
    const amount = Math.round(Math.random() * 3 * 1000) / 1000;
    orders.push({
      price,
      amount,
      total: Math.round(price * amount * 100) / 100,
    });
  }
  return orders;
};

interface OrderBookProps {
  currentPrice: number;
}

export function OrderBook({ currentPrice }: OrderBookProps) {
  const [buyOrders, setBuyOrders] = useState<Order[]>(generateOrders(currentPrice, 'buy'));
  const [sellOrders, setSellOrders] = useState<Order[]>(generateOrders(currentPrice, 'sell'));

  useEffect(() => {
    const interval = setInterval(() => {
      setBuyOrders(generateOrders(currentPrice, 'buy'));
      setSellOrders(generateOrders(currentPrice, 'sell'));
    }, 5000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  return (
    <div className="bg-[#161a1e] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-gray-400" />
        <h2 className="text-lg font-semibold">Order Book</h2>
      </div>

      <div className="text-xs">
        <div className="grid grid-cols-3 text-gray-400 mb-2 px-2">
          <div>Price(USDT)</div>
          <div className="text-right">Amount(BTC)</div>
          <div className="text-right">Total</div>
        </div>

        {/* Sell Orders */}
        <div className="space-y-1 mb-3">
          {sellOrders.slice(0, 8).reverse().map((order, index) => (
            <div
              key={`sell-${index}`}
              className="grid grid-cols-3 py-1 px-2 hover:bg-[#1e2329] rounded relative overflow-hidden"
            >
              <div
                className="absolute right-0 top-0 bottom-0 bg-[#f6465d]/10"
                style={{ width: `${(order.amount / 3) * 100}%` }}
              />
              <div className="text-[#f6465d] relative z-10">{order.price.toLocaleString()}</div>
              <div className="text-right text-white relative z-10">{order.amount.toFixed(4)}</div>
              <div className="text-right text-gray-400 relative z-10">{order.total.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* Current Price */}
        <div className="text-center py-2 mb-3 bg-[#0ecb81]/10 rounded">
          <span className="text-lg font-semibold text-[#0ecb81]">
            {currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-gray-400 ml-2">≈ ${currentPrice.toLocaleString()}</span>
        </div>

        {/* Buy Orders */}
        <div className="space-y-1">
          {buyOrders.slice(0, 8).map((order, index) => (
            <div
              key={`buy-${index}`}
              className="grid grid-cols-3 py-1 px-2 hover:bg-[#1e2329] rounded relative overflow-hidden"
            >
              <div
                className="absolute right-0 top-0 bottom-0 bg-[#0ecb81]/10"
                style={{ width: `${(order.amount / 3) * 100}%` }}
              />
              <div className="text-[#0ecb81] relative z-10">{order.price.toLocaleString()}</div>
              <div className="text-right text-white relative z-10">{order.amount.toFixed(4)}</div>
              <div className="text-right text-gray-400 relative z-10">{order.total.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
