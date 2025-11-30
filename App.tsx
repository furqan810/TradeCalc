import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  RotateCcw, 
  Wallet, 
  Target, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  ShieldAlert,
  Scale,
  FileDown,
  Activity,
  Wifi,
  WifiOff,
  CandlestickChart,
  Maximize2,
  Minimize2
} from 'lucide-react';
import InputField from './components/InputField';
import PnLChart from './components/PnLChart';
import TradingViewWidget from './components/TradingViewWidget';
import { TradeState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<TradeState>({
    ticker: 'BTCUSDT',
    buyPrice: 42000.00,
    sellPrice: 45000.00,
    stopLossPrice: 40000.00,
    mode: 'investment',
    amount: 5000, 
  });

  // Real-time Data State
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [activeTab, setActiveTab] = useState<'analysis' | 'chart'>('analysis');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);

  const { ticker, buyPrice, sellPrice, stopLossPrice, mode, amount } = state;

  // --- WEBSOCKET CONNECTION ---
  useEffect(() => {
    // Reset connection when ticker changes
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Basic cleaning of ticker
    const symbol = ticker.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!symbol) return;

    // Use Binance WebSocket for Crypto (Free, No Auth, Real-time)
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`;
    
    const connect = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const price = parseFloat(data.p);
        
        setCurrentPrice(prev => {
          if (prev && price > prev) setPriceDirection('up');
          else if (prev && price < prev) setPriceDirection('down');
          return price;
        });
      };

      ws.onerror = () => {
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
      };
    };

    connect();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [ticker]);

  // Flash Effect Reset
  useEffect(() => {
    const timer = setTimeout(() => setPriceDirection('neutral'), 1000);
    return () => clearTimeout(timer);
  }, [currentPrice]);

  // Auto-collapse when switching tabs (safety check)
  useEffect(() => {
    setIsExpanded(false);
  }, [activeTab]);

  // --- CALCULATIONS ---
  const investment = useMemo(() => {
    return mode === 'investment' ? amount : amount * buyPrice;
  }, [amount, buyPrice, mode]);

  const quantity = useMemo(() => {
    if (buyPrice === 0) return 0;
    return mode === 'quantity' ? amount : amount / buyPrice;
  }, [amount, buyPrice, mode]);

  // Target Calculations
  const revenue = quantity * sellPrice;
  const profit = revenue - investment;
  const roi = investment !== 0 ? (profit / investment) * 100 : 0;
  const isProfitable = profit >= 0;

  // Stop Loss Calculations
  const stopLossRevenue = quantity * stopLossPrice;
  const stopLossProfit = stopLossRevenue - investment; 
  const stopLossRoi = investment !== 0 ? (stopLossProfit / investment) * 100 : 0;

  // Risk to Reward
  const riskPerShare = Math.abs(buyPrice - stopLossPrice);
  const rewardPerShare = Math.abs(sellPrice - buyPrice);
  const riskRewardRatio = riskPerShare !== 0 ? (rewardPerShare / riskPerShare) : 0;

  const handleUpdate = (field: Partial<TradeState>) => {
    setState(prev => ({ ...prev, ...field }));
  };

  const handleReset = () => {
    setState({
      ticker: 'BTCUSDT',
      buyPrice: 42000.00,
      sellPrice: 45000.00,
      stopLossPrice: 40000.00,
      mode: 'investment',
      amount: 5000,
    });
  };

  const handleSyncPrice = (field: 'buyPrice' | 'sellPrice' | 'stopLossPrice') => {
    if (currentPrice) {
      handleUpdate({ [field]: currentPrice });
    }
  };

  const handleExport = () => {
    const headers = ['Date', 'Ticker', 'Entry Price', 'Exit Target', 'Stop Loss', 'Total Investment', 'Share Quantity', 'Target Profit', 'Target ROI %', 'Risk/Reward'];
    const data = [
      new Date().toLocaleDateString(),
      ticker,
      buyPrice.toFixed(2),
      sellPrice.toFixed(2),
      stopLossPrice.toFixed(2),
      investment.toFixed(2),
      quantity.toFixed(4),
      profit.toFixed(2),
      roi.toFixed(2),
      `1:${riskRewardRatio.toFixed(2)}`
    ];
    const csvContent = [headers.join(','), data.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${ticker}_plan_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="min-h-screen flex items-center justify-center p-2 lg:p-6 font-sans">
      
      {/* Main Glass Card Container */}
      <div className="w-[98%] max-w-[1920px] bg-gray-900/60 backdrop-blur-2xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[85vh]">
        
        {/* Left Panel: Controls */}
        <div className="w-full lg:w-[400px] xl:w-[450px] bg-gray-950/80 p-6 lg:p-8 xl:p-10 border-r border-white/5 flex flex-col z-10 shrink-0">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg shadow-blue-500/20">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">TradeCalc</h1>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Pro Simulator</p>
              </div>
            </div>
            {/* Live Status Indicator */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${isConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span className="text-[10px] font-bold tracking-wider">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
            </div>
          </div>

          {/* Ticker Input & Live Price */}
          <div className="mb-8 p-4 bg-gray-900/50 rounded-xl border border-white/5">
             <div className="mb-3">
               <label className="text-xs font-semibold text-gray-500 tracking-wide uppercase mb-2 block">Ticker Symbol</label>
               <input 
                  type="text" 
                  value={ticker}
                  onChange={(e) => handleUpdate({ ticker: e.target.value })}
                  className="w-full bg-transparent text-xl font-bold text-white placeholder-gray-700 focus:outline-none uppercase tracking-wider font-mono"
                  placeholder="BTCUSDT"
               />
             </div>
             
             <div className="flex items-end justify-between">
                <span className="text-xs text-gray-500 font-medium">Current Price</span>
                <div className={`flex items-center gap-2 transition-colors duration-300 ${priceDirection === 'up' ? 'text-emerald-400' : priceDirection === 'down' ? 'text-rose-400' : 'text-gray-200'}`}>
                  {priceDirection === 'up' && <ArrowUpRight className="w-4 h-4" />}
                  {priceDirection === 'down' && <ArrowDownRight className="w-4 h-4" />}
                  <span className="text-2xl font-mono font-bold tracking-tight">
                    {currentPrice ? formatCurrency(currentPrice) : '---'}
                  </span>
                </div>
             </div>
          </div>

          {/* Inputs */}
          <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm font-medium">
                <Target className="w-4 h-4 text-blue-500" />
                <span>Price Targets</span>
              </div>
              <InputField 
                label="Entry Price" 
                value={buyPrice} 
                onChange={(v) => handleUpdate({ buyPrice: parseFloat(v) || 0 })} 
                onSync={currentPrice ? () => handleSyncPrice('buyPrice') : undefined}
                prefix="$" 
                placeholder="0.00"
              />
              <InputField 
                label="Exit Target" 
                value={sellPrice} 
                onChange={(v) => handleUpdate({ sellPrice: parseFloat(v) || 0 })}
                onSync={currentPrice ? () => handleSyncPrice('sellPrice') : undefined} 
                prefix="$" 
                placeholder="0.00"
              />
              <InputField 
                label="Stop Loss" 
                value={stopLossPrice} 
                onChange={(v) => handleUpdate({ stopLossPrice: parseFloat(v) || 0 })} 
                onSync={currentPrice ? () => handleSyncPrice('stopLossPrice') : undefined}
                prefix="$" 
                placeholder="0.00"
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                  <span>Position Size</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-800 text-gray-400 border border-gray-700">
                  {mode === 'investment' ? 'BY AMOUNT ($)' : 'BY SHARES (Qty)'}
                </span>
              </div>

              <InputField 
                label="Total Investment" 
                value={mode === 'investment' ? amount : investment} 
                onChange={(v) => handleUpdate({ mode: 'investment', amount: parseFloat(v) || 0 })} 
                onFocus={() => handleUpdate({ mode: 'investment' })}
                prefix="$" 
                placeholder="0.00"
                active={mode === 'investment'}
              />
              
              <InputField 
                label="Share Quantity" 
                value={mode === 'quantity' ? amount : quantity} 
                onChange={(v) => handleUpdate({ mode: 'quantity', amount: parseFloat(v) || 0 })}
                onFocus={() => handleUpdate({ mode: 'quantity' })}
                suffix="SHARES"
                placeholder="0"
                active={mode === 'quantity'}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
            <button 
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/90 border border-emerald-500/20 hover:border-emerald-500/50 transition-all group"
            >
              <FileDown className="w-4 h-4" />
              Export to CSV
            </button>

            <button 
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 transition-all group"
            >
              <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
              Reset All Values
            </button>
          </div>
        </div>

        {/* Right Panel: Analytics */}
        <div className="flex-1 p-6 lg:p-8 xl:p-10 flex flex-col bg-gradient-to-br from-gray-900/40 to-transparent overflow-hidden">
          
          {/* Top Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 xl:mb-8 shrink-0">
            
            {/* Target Profit Card */}
            <div className={`bg-gray-950/40 border rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-[120px] xl:h-[140px] ${isProfitable ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
              <div className={`absolute top-0 right-0 p-3 opacity-20 ${isProfitable ? 'text-emerald-500' : 'text-rose-500'}`}>
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Target P&L</p>
                <p className={`text-xl xl:text-2xl font-mono font-bold tracking-tight ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isProfitable ? '+' : ''}{formatCurrency(profit)}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-900/50 w-fit px-2 py-1 rounded-md border border-white/5">
                {isProfitable ? <ArrowUpRight className="w-3 h-3 text-emerald-500" /> : <ArrowDownRight className="w-3 h-3 text-rose-500" />}
                <span>{roi.toFixed(1)}% ROI</span>
              </div>
            </div>

            {/* Stop Loss Risk Card */}
            <div className="bg-gray-950/40 border border-rose-500/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-[120px] xl:h-[140px] hover:border-rose-500/30 transition-colors">
              <div className="absolute top-0 right-0 p-3 opacity-20 text-rose-500">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Max Loss</p>
                <p className="text-xl xl:text-2xl font-mono font-bold tracking-tight text-rose-400">
                  {formatCurrency(stopLossProfit)}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-900/50 w-fit px-2 py-1 rounded-md border border-white/5">
                <ArrowDownRight className="w-3 h-3 text-rose-500" />
                <span>{stopLossRoi.toFixed(1)}% Risk</span>
              </div>
            </div>

            {/* Total Value Card */}
            <div className="bg-gray-950/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-[120px] xl:h-[140px]">
              <div>
                 <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Target Value</p>
                 <p className="text-xl xl:text-2xl font-mono font-bold text-white tracking-tight">{formatCurrency(revenue)}</p>
              </div>
              <div className="text-[10px] text-blue-400 bg-blue-400/10 w-fit px-2 py-1 rounded-md border border-blue-400/20">
                  {quantity.toFixed(2)} Shares
              </div>
            </div>

             {/* R:R Ratio Card */}
             <div className="bg-gray-950/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-[120px] xl:h-[140px]">
              <div className="flex justify-between items-start">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Risk/Reward</p>
                <Scale className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-xl xl:text-2xl font-mono font-bold text-indigo-300">
                  1:{riskRewardRatio.toFixed(1)}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  For every $1 risk, you make ${riskRewardRatio.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Main Chart Section - Fullscreen Logic */}
          <div className={`
            ${isExpanded ? 'fixed inset-0 z-50 bg-gray-950' : 'flex-1 bg-gray-950/30 border border-white/5 rounded-3xl min-h-[400px]'}
            ${isExpanded ? 'p-0' : 'p-6'} 
            relative flex flex-col transition-all duration-300
          `}>
            
            {/* Header / Tabs - Hide if Expanded */}
            {!isExpanded && (
              <div className="flex justify-between items-center mb-6 shrink-0">
                <div className="flex bg-gray-900/50 p-1 rounded-lg border border-white/5">
                  <button 
                    onClick={() => setActiveTab('analysis')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === 'analysis' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    Analysis Curve
                  </button>
                  <button 
                    onClick={() => setActiveTab('chart')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === 'chart' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <CandlestickChart className="w-3.5 h-3.5" />
                    Live Market
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Legend for Analysis */}
                  {activeTab === 'analysis' && (
                    <div className="flex gap-4 text-xs font-medium text-gray-500 hidden sm:flex">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-0.5 bg-emerald-500"></span> Profit
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-0.5 bg-rose-500"></span> Loss
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full border border-rose-500 bg-rose-500/50"></span> Stop
                      </span>
                    </div>
                  )}
                  
                  {/* Maximize Button - ONLY for Chart */}
                  {activeTab === 'chart' && (
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="p-2 text-gray-500 hover:text-white bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-white/10"
                      title="Enter Fullscreen"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Floating Minimize Button - Only if Expanded */}
            {isExpanded && (
               <button 
                 onClick={() => setIsExpanded(false)}
                 className="absolute top-4 right-4 z-[60] p-2 bg-gray-800/90 text-white rounded-lg shadow-lg hover:bg-gray-700 border border-white/10 backdrop-blur-sm"
                 title="Exit Fullscreen"
               >
                 <Minimize2 className="w-6 h-6" />
               </button>
            )}
            
            {/* Content Area - Fills remaining space */}
            <div className="flex-1 w-full relative">
               {activeTab === 'analysis' ? (
                  buyPrice > 0 ? (
                    <div className="absolute inset-0">
                      <PnLChart 
                        buyPrice={buyPrice} 
                        sellPrice={sellPrice} 
                        stopLossPrice={stopLossPrice}
                        quantity={quantity} 
                        investment={investment} 
                      />
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2">
                      <BarChart3 className="w-8 h-8 opacity-50" />
                      <p>Enter trade parameters to visualize</p>
                    </div>
                  )
               ) : (
                  <div className="absolute inset-0">
                    <TradingViewWidget symbol={ticker} />
                  </div>
               )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;