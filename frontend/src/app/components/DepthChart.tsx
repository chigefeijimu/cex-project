import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DepthChartProps {
  currentPrice: number;
}

export function DepthChart({ currentPrice }: DepthChartProps) {
  const depthData = useMemo(() => {
    const bids = [];
    const asks = [];
    let cumulativeBid = 0;
    let cumulativeAsk = 0;

    // Generate bid data (buy orders)
    for (let i = 50; i >= 0; i--) {
      const price = currentPrice - i * 10;
      const amount = Math.random() * 5 + 1;
      cumulativeBid += amount;
      bids.push({
        price: Math.round(price * 100) / 100,
        amount: Math.round(cumulativeBid * 1000) / 1000,
        type: 'bid'
      });
    }

    // Generate ask data (sell orders)
    for (let i = 1; i <= 50; i++) {
      const price = currentPrice + i * 10;
      const amount = Math.random() * 5 + 1;
      cumulativeAsk += amount;
      asks.push({
        price: Math.round(price * 100) / 100,
        amount: Math.round(cumulativeAsk * 1000) / 1000,
        type: 'ask'
      });
    }

    return [...bids, ...asks];
  }, [currentPrice]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1e2329] border border-[#2b3139] rounded p-2 text-xs">
          <div className="text-gray-400">Price: <span className="text-white">${data.price.toLocaleString()}</span></div>
          <div className="text-gray-400">Amount: <span className="text-white">{data.amount}</span></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#161a1e] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">深度图</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#0ecb81] rounded-sm" />
            <span className="text-gray-400">买单</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#f6465d] rounded-sm" />
            <span className="text-gray-400">卖单</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={depthData}>
          <defs>
            <linearGradient id="bidGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ecb81" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#0ecb81" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="askGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f6465d" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#f6465d" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="price"
            stroke="#474d57"
            tick={{ fill: '#848e9c', fontSize: 10 }}
            tickLine={false}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <YAxis
            stroke="#474d57"
            tick={{ fill: '#848e9c', fontSize: 10 }}
            tickLine={false}
            orientation="right"
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="stepAfter"
            dataKey={(item) => (item.type === 'bid' ? item.amount : null)}
            stroke="#0ecb81"
            strokeWidth={2}
            fill="url(#bidGradient)"
            isAnimationActive={false}
          />
          <Area
            type="stepAfter"
            dataKey={(item) => (item.type === 'ask' ? item.amount : null)}
            stroke="#f6465d"
            strokeWidth={2}
            fill="url(#askGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
