import { useState, useEffect } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Maximize2, Settings, TrendingUp } from 'lucide-react';

interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  range: [number, number];
}

interface AdvancedChartProps {
  currentPrice: number;
  setCurrentPrice: (price: number) => void;
}

const generateCandlestickData = (): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  let price = 64000;
  const now = Date.now();

  for (let i = 100; i >= 0; i--) {
    const open = price;
    const change = (Math.random() - 0.5) * 500;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 200;
    const low = Math.min(open, close) - Math.random() * 200;
    const volume = Math.random() * 100;

    data.push({
      time: new Date(now - i * 300000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.round(volume * 100) / 100,
      range: [Math.round(low * 100) / 100, Math.round(high * 100) / 100]
    });

    price = close;
  }

  return data;
};

const CustomCandlestick = (props: any) => {
  const { x, y, width, height, payload } = props;
  const isUp = payload.close >= payload.open;
  const color = isUp ? '#0ecb81' : '#f6465d';

  const range = payload.high - payload.low;
  if (range === 0) return null;

  const scale = height / range;
  const openY = y + (payload.high - payload.open) * scale;
  const closeY = y + (payload.high - payload.close) * scale;

  const bodyTop = Math.min(openY, closeY);
  const bodyBottom = Math.max(openY, closeY);
  const bodyHeight = Math.max(1, bodyBottom - bodyTop);

  return (
    <g stroke={color} fill={color}>
      {/* Wick */}
      <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + height} strokeWidth={1} />
      {/* Body */}
      <rect x={x} y={bodyTop} width={width} height={bodyHeight} />
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1e2329] border border-[#2b3139] p-3 rounded-md shadow-lg">
        <p className="text-gray-400 mb-2">{data.time}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">开</span>
            <span className="text-white">${data.open.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">高</span>
            <span className="text-white">${data.high.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">低</span>
            <span className="text-white">${data.low.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">收</span>
            <span className="text-white">${data.close.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">成交量</span>
            <span className="text-white">{data.volume.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function AdvancedChart({ currentPrice, setCurrentPrice }: AdvancedChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>(generateCandlestickData());
  const [timeframe, setTimeframe] = useState('15m');
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick');
  const [showVolume, setShowVolume] = useState(true);
  const [showIndicators, setShowIndicators] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 100;
      const newPrice = Math.round((currentPrice + change) * 100) / 100;
      setCurrentPrice(newPrice);

      setChartData(prev => {
        const lastData = prev[prev.length - 1];
        const newData: ChartDataPoint = {
          time: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          open: lastData.close,
          high: Math.max(lastData.close, newPrice) + Math.random() * 50,
          low: Math.min(lastData.close, newPrice) - Math.random() * 50,
          close: newPrice,
          volume: Math.random() * 100,
          range: [0, 0] // Placeholder
        };
        newData.range = [newData.low, newData.high];
        return [...prev.slice(1), newData];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [currentPrice, setCurrentPrice]);

  const timeframes = [
    { label: '1分钟', value: '1m' },
    { label: '5分钟', value: '5m' },
    { label: '15分钟', value: '15m' },
    { label: '1小时', value: '1h' },
    { label: '4小时', value: '4h' },
    { label: '1日', value: '1d' },
    { label: '1周', value: '1w' }
  ];

  const CandlestickChart = () => (
    <ResponsiveContainer width="100%" height={showVolume ? 350 : 450}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" />
        <XAxis
          dataKey="time"
          stroke="#474d57"
          tick={{ fill: '#848e9c', fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          domain={['dataMin - 200', 'dataMax + 200']}
          stroke="#474d57"
          tick={{ fill: '#848e9c', fontSize: 12 }}
          tickLine={false}
          orientation="right"
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="range"
          shape={<CustomCandlestick />}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="close"
          stroke="#3861fb"
          strokeWidth={1}
          dot={false}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  const LineChart = () => (
    <ResponsiveContainer width="100%" height={showVolume ? 350 : 450}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" />
        <XAxis
          dataKey="time"
          stroke="#474d57"
          tick={{ fill: '#848e9c', fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          domain={['dataMin - 200', 'dataMax + 200']}
          stroke="#474d57"
          tick={{ fill: '#848e9c', fontSize: 12 }}
          tickLine={false}
          orientation="right"
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
        <Line
          type="monotone"
          dataKey="close"
          stroke="#0ecb81"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  const AreaChart = () => (
    <ResponsiveContainer width="100%" height={showVolume ? 350 : 450}>
      <ComposedChart data={chartData}>
        <defs>
          <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ecb81" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#0ecb81" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" />
        <XAxis
          dataKey="time"
          stroke="#474d57"
          tick={{ fill: '#848e9c', fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          domain={['dataMin - 200', 'dataMax + 200']}
          stroke="#474d57"
          tick={{ fill: '#848e9c', fontSize: 12 }}
          tickLine={false}
          orientation="right"
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
          dataKey="close"
          stroke="#0ecb81"
          strokeWidth={2}
          fill="url(#colorArea)"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  return (
    <div className="bg-[#161a1e] rounded-lg">
      {/* Chart Controls */}
      <div className="flex items-center justify-between p-4 border-b border-[#2b3139]">
        <div className="flex items-center gap-4">
          {/* Time Frames */}
          <div className="flex gap-1">
            {timeframes.map(tf => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-3 py-1.5 rounded text-xs transition-colors ${
                  timeframe === tf.value
                    ? 'bg-[#2b3139] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#1e2329]'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-[#2b3139]" />

          {/* Chart Types */}
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('candlestick')}
              className={`px-3 py-1.5 rounded text-xs ${
                chartType === 'candlestick'
                  ? 'bg-[#2b3139] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              蜡烛图
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 rounded text-xs ${
                chartType === 'line'
                  ? 'bg-[#2b3139] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              折线图
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 rounded text-xs ${
                chartType === 'area'
                  ? 'bg-[#2b3139] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              面积图
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIndicators(!showIndicators)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs transition-colors ${
              showIndicators ? 'bg-[#2b3139] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            指标
          </button>
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2b3139] rounded transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2b3139] rounded transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-4">
        {chartType === 'candlestick' && <CandlestickChart />}
        {chartType === 'line' && <LineChart />}
        {chartType === 'area' && <AreaChart />}

        {/* Volume Chart */}
        {showVolume && (
          <ResponsiveContainer width="100%" height={100}>
            <ComposedChart data={chartData}>
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <Bar dataKey="volume">
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.close >= entry.open ? '#0ecb81' : '#f6465d'}
                    opacity={0.5}
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
