import { useState, useEffect } from 'react';
import { TradingPairSelector } from '../components/TradingPairSelector';
import { MarketInfo } from '../components/MarketInfo';
import { AdvancedChart } from '../components/AdvancedChart';
import { DepthChart } from '../components/DepthChart';
import { OrderBook } from '../components/OrderBook';
import { TradeHistory } from '../components/TradeHistory';
import { AdvancedTradingForm } from '../components/AdvancedTradingForm';
import { OrderManagement } from '../components/OrderManagement';
import { MarketActivity } from '../components/MarketActivity';
import { Announcements } from '../components/Announcements';
import { marketApi, walletApi, orderApi, Symbol, Balance } from '../services/api';

interface TradingPair {
  symbol: string;
  pair: string;
  price: number;
  change: number;
  volume: string;
  isFavorite?: boolean;
}

const DEFAULT_USER_ID = "default"; // 默认用户ID

export function SpotTrading() {
  const [currentPrice, setCurrentPrice] = useState(0);
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [balances, setBalances] = useState<Record<string, number>>({
    BTC: 0,
    USDT: 0
  });
  const [showDepthChart, setShowDepthChart] = useState(false);
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载交易对列表和初始数据
  useEffect(() => {
    const loadData = async () => {
      try {
        // 获取交易对列表
        const symbolsRes = await marketApi.getSymbols();
        if (symbolsRes.data) {
          setSymbols(symbolsRes.data);
          // 设置默认交易对价格
          const btcData = symbolsRes.data.find((s: Symbol) => s.symbol === 'BTC/USDT');
          if (btcData) {
            setCurrentPrice(btcData.price);
          }
        }

        // 获取钱包余额
        const balanceRes = await walletApi.getBalance(DEFAULT_USER_ID);
        if (balanceRes.data) {
          const balanceMap: Record<string, number> = {};
          balanceRes.data.forEach((b: Balance) => {
            const currency = b.currency.replace('USDT', 'USDT');
            balanceMap[currency] = b.available;
          });
          setBalances(balanceMap);
        }
      } catch (error) {
        console.error('Failed to load trading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 定时刷新价格
  useEffect(() => {
    const fetchPrice = async () => {
      if (!selectedPair) return;
      const pair = selectedPair.replace('/', '');
      const tickerRes = await marketApi.getTicker(pair);
      if (tickerRes.data) {
        setCurrentPrice(tickerRes.data.price);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 5000); // 每5秒刷新
    return () => clearInterval(interval);
  }, [selectedPair]);

  const handleTrade = async (type: 'buy' | 'sell', amount: number, price: number) => {
    const symbol = selectedPair.replace('/', '');
    const orderType = 'limit';
    
    try {
      const result = await orderApi.place(symbol, type, orderType, price, amount);
      if (result.data) {
        // 重新获取余额
        const balanceRes = await walletApi.getBalance(DEFAULT_USER_ID);
        if (balanceRes.data) {
          const balanceMap: Record<string, number> = {};
          balanceRes.data.forEach((b: Balance) => {
            balanceMap[b.currency] = b.available;
          });
          setBalances(balanceMap);
        }
      }
    } catch (error) {
      console.error('Trade failed:', error);
    }
  };

  const handleSelectPair = (pair: TradingPair) => {
    setSelectedPair(pair.pair);
    setCurrentPrice(pair.price);
  };

  return (
    <>
      {/* Trading Pair Selector & Market Info */}
      <div className="border-b border-[#2b3139] px-6 py-3 flex items-center gap-4">
        <TradingPairSelector 
          currentPair={selectedPair}
          onSelectPair={handleSelectPair}
        />
      </div>
      <MarketInfo currentPrice={currentPrice} selectedPair={selectedPair} />

      {/* Main Trading Interface */}
      <div className="p-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Left Column - Market Activity & Announcements */}
          <div className="col-span-12 lg:col-span-2 space-y-4">
            <MarketActivity />
            <Announcements />
          </div>

          {/* Center Column - Chart & Trade History */}
          <div className="col-span-12 lg:col-span-7 space-y-4">
            {/* Chart Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowDepthChart(false)}
                className={`px-4 py-2 rounded text-sm transition-colors ${
                  !showDepthChart
                    ? 'bg-[#2b3139] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#1e2329]'
                }`}
              >
                K线图
              </button>
              <button
                onClick={() => setShowDepthChart(true)}
                className={`px-4 py-2 rounded text-sm transition-colors ${
                  showDepthChart
                    ? 'bg-[#2b3139] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#1e2329]'
                }`}
              >
                深度图
              </button>
            </div>

            {/* Chart Area */}
            {!showDepthChart ? (
              <AdvancedChart currentPrice={currentPrice} setCurrentPrice={setCurrentPrice} />
            ) : (
              <DepthChart currentPrice={currentPrice} />
            )}

            {/* Trade History */}
            <TradeHistory />

            {/* Order Management */}
            <OrderManagement />
          </div>

          {/* Right Column - Order Book & Trading Form */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <OrderBook currentPrice={currentPrice} />
            <AdvancedTradingForm 
              currentPrice={currentPrice}
              onTrade={handleTrade}
              balances={balances}
            />
          </div>
        </div>
      </div>
    </>
  );
}
