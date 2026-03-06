import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface PriceChartProps {
  currentPrice: number;
  setCurrentPrice: (price: number) => void;
}

// 生成模拟K线数据
const generateInitialData = () => {
  const data = [];
  let price = 64000;
  const now = Date.now();
  
  for (let i = 100; i >= 0; i--) {
    const change = (Math.random() - 0.5) * 500;
    price += change;
    data.push({
      time: new Date(now - i * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      price: Math.round(price * 100) / 100,
    });
  }
  
  return data;
};

export function PriceChart({ currentPrice, setCurrentPrice }: PriceChartProps) {
  const [chartData, setChartData] = useState(generateInitialData());
  const [timeframe, setTimeframe] = useState('1H');

  useEffect(() => {
    // 实时更新价格
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 100;
      const newPrice = Math.round((currentPrice + change) * 100) / 100;
      setCurrentPrice(newPrice);
      
      setChartData(prev => {
        const newData = [...prev.slice(1), {
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          price: newPrice,
        }];
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentPrice, setCurrentPrice]);

  const timeframes = ['15M', '1H', '4H', '1D', '1W'];

  return (
    <div className="bg-[#161a1e] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Price Chart</h2>
          <div className="flex gap-2">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded text-sm ${
                  timeframe === tf
                    ? 'bg-[#2b3139] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-[#0ecb81]">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm">Live</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ecb81" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0ecb81" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            stroke="#2b3139"
            tick={{ fill: '#848e9c' }}
            tickLine={false}
          />
          <YAxis 
            domain={['dataMin - 200', 'dataMax + 200']}
            stroke="#2b3139"
            tick={{ fill: '#848e9c' }}
            tickLine={false}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e2329',
              border: '1px solid #2b3139',
              borderRadius: '4px',
              color: '#fff'
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#0ecb81"
            strokeWidth={2}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
