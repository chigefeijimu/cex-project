import { useState } from 'react';
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

interface TradingPair {
  symbol: string;
  pair: string;
  price: number;
  change: number;
  volume: string;
  isFavorite?: boolean;
}

export function SpotTrading() {
  const [currentPrice, setCurrentPrice] = useState(65432.50);
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [balances, setBalances] = useState({
    BTC: 0.5234,
    USDT: 15234.67
  });
  const [showDepthChart, setShowDepthChart] = useState(false);

  const handleTrade = (type: 'buy' | 'sell', amount: number, price: number) => {
    const total = amount * price;
    
    if (type === 'buy') {
      if (balances.USDT >= total) {
        setBalances({
          BTC: balances.BTC + amount,
          USDT: balances.USDT - total
        });
      }
    } else {
      if (balances.BTC >= amount) {
        setBalances({
          BTC: balances.BTC - amount,
          USDT: balances.USDT + total
        });
      }
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
