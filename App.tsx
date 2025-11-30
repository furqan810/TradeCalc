import React, { useState, useMemo } from 'react';
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
  Scale
} from 'lucide-react';
import InputField from './components/InputField';
import PnLChart from './components/PnLChart';
import { TradeState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<TradeState>({
    buyPrice: 150.00,
    sellPrice: 175.50,
    stopLossPrice: 135.00,
    mode: 'investment',
    amount: 5000, 
  });

  const { buyPrice, sellPrice, stopLossPrice, mode, amount } = state;

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
  const stopLossProfit = stopLossRevenue - investment; // This will be negative (loss)
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
      buyPrice: 150,
      sellPrice: 175.50,
      stopLossPrice: 135.00,
      mode: 'investment',
      amount: 5000,
    });
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8 font-sans">
      
      {/* Main Glass Card Container */}
      <div className="w-full max-w-6xl bg-gray-900/60 backdrop-blur-2xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[700px]">
        
        {/* Left Panel: Controls */}
        <div className="w-full lg:w-[400px] bg-gray-950/80 p-6 lg:p-10 border-r border-white/5 flex flex-col z-10">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg shadow-blue-500/20">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">TradeCalc</h1>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Pro Simulator</p>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-8 flex-1">
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm font-medium">
                <Target className="w-4 h-4 text-blue-500" />
                <span>Price Targets</span>
              </div>
              <InputField 
                label="Entry Price" 
                value={buyPrice} 
                onChange={(v) => handleUpdate({ buyPrice: parseFloat(v) || 0 })} 
                prefix="$" 
                placeholder="0.00"
              />
              <InputField 
                label="Exit Target" 
                value={sellPrice} 
                onChange={(v) => handleUpdate({ sellPrice: parseFloat(v) || 0 })} 
                prefix="$" 
                placeholder="0.00"
              />
              <InputField 
                label="Stop Loss" 
                value={stopLossPrice} 
                onChange={(v) => handleUpdate({ stopLossPrice: parseFloat(v) || 0 })} 
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
                {/* Mode Indicator */}
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
          <div className="mt-10 pt-6 border-t border-white/5">
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
        <div className="flex-1 p-6 lg:p-10 flex flex-col bg-gradient-to-br from-gray-900/40 to-transparent">
          
          {/* Top Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            
            {/* Target Profit Card */}
            <div className={`bg-gray-950/40 border rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-[140px] ${isProfitable ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
              <div className={`absolute top-0 right-0 p-3 opacity-20 ${isProfitable ? 'text-emerald-500' : 'text-rose-500'}`}>
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Target P&L</p>
                <p className={`text-xl font-mono font-bold tracking-tight ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isProfitable ? '+' : ''}{formatCurrency(profit)}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-900/50 w-fit px-2 py-1 rounded-md border border-white/5">
                {isProfitable ? <ArrowUpRight className="w-3 h-3 text-emerald-500" /> : <ArrowDownRight className="w-3 h-3 text-rose-500" />}
                <span>{roi.toFixed(1)}% ROI</span>
              </div>
            </div>

            {/* Stop Loss Risk Card */}
            <div className="bg-gray-950/40 border border-rose-500/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-[140px] hover:border-rose-500/30 transition-colors">
              <div className="absolute top-0 right-0 p-3 opacity-20 text-rose-500">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Max Loss</p>
                <p className="text-xl font-mono font-bold tracking-tight text-rose-400">
                  {formatCurrency(stopLossProfit)}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-900/50 w-fit px-2 py-1 rounded-md border border-white/5">
                <ArrowDownRight className="w-3 h-3 text-rose-500" />
                <span>{stopLossRoi.toFixed(1)}% Risk</span>
              </div>
            </div>

            {/* Total Value Card */}
            <div className="bg-gray-950/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-[140px]">
              <div>
                 <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Target Value</p>
                 <p className="text-xl font-mono font-bold text-white tracking-tight">{formatCurrency(revenue)}</p>
              </div>
              <div className="text-[10px] text-blue-400 bg-blue-400/10 w-fit px-2 py-1 rounded-md border border-blue-400/20">
                  {quantity.toFixed(2)} Shares
              </div>
            </div>

             {/* R:R Ratio Card */}
             <div className="bg-gray-950/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-[140px]">
              <div className="flex justify-between items-start">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Risk/Reward</p>
                <Scale className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-indigo-300">
                  1:{riskRewardRatio.toFixed(1)}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  For every $1 risk, you make ${riskRewardRatio.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Main Chart Section */}
          <div className="flex-1 bg-gray-950/30 border border-white/5 rounded-3xl p-6 relative flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Analysis Curve
              </h3>
              <div className="flex gap-4 text-xs font-medium text-gray-500">
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
            </div>
            
            <div className="flex-1 min-h-[300px] w-full">
              {buyPrice > 0 ? (
                <PnLChart 
                  buyPrice={buyPrice} 
                  sellPrice={sellPrice} 
                  stopLossPrice={stopLossPrice}
                  quantity={quantity} 
                  investment={investment} 
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2">
                  <BarChart3 className="w-8 h-8 opacity-50" />
                  <p>Enter trade parameters to visualize</p>
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