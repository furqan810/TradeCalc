import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceDot
} from 'recharts';
import { ChartDataPoint } from '../types';

interface PnLChartProps {
  buyPrice: number;
  sellPrice: number;
  stopLossPrice: number;
  quantity: number;
  investment: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isProfit = data.profit >= 0;
    return (
      <div className="bg-gray-900/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl z-50">
        <div className="flex items-center justify-between gap-4 mb-2">
           <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Price Point</span>
           <span className="text-white font-mono font-bold">${Number(label).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
           <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Outcome</span>
           <span className={`${isProfit ? 'text-emerald-400' : 'text-rose-400'} font-bold font-mono text-lg`}>
             {isProfit ? '+' : ''}${data.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
           </span>
        </div>
      </div>
    );
  }
  return null;
};

const PnLChart: React.FC<PnLChartProps> = ({ buyPrice, sellPrice, stopLossPrice, quantity, investment }) => {
  
  const chartData = useMemo(() => {
    if (!buyPrice || !quantity) return [];

    const rangePercentage = 0.4; // Default 40% range
    const centerPrice = buyPrice;
    
    // Adjust min/max to ensure Stop Loss and Sell Price are always visible with some padding
    const minPrice = Math.min(centerPrice * (1 - rangePercentage), stopLossPrice * 0.9);
    const maxPrice = Math.max(centerPrice * (1 + rangePercentage), sellPrice * 1.1);
    
    const steps = 60; // Smooth curve
    const stepSize = (maxPrice - minPrice) / steps;
    const data: ChartDataPoint[] = [];

    for (let i = 0; i <= steps; i++) {
      const price = minPrice + (i * stepSize);
      const profit = (price - buyPrice) * quantity;
      
      data.push({
        price: price,
        profit: profit,
        isCurrent: false,
        isBreakEven: false
      });
    }
    
    return data;
  }, [buyPrice, sellPrice, stopLossPrice, quantity]);

  const gradientOffset = () => {
    const dataMax = Math.max(...chartData.map((i) => i.profit));
    const dataMin = Math.min(...chartData.map((i) => i.profit));
  
    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }
  
    return dataMax / (dataMax - dataMin);
  };
  
  const off = gradientOffset();
  const currentPnL = (sellPrice - buyPrice) * quantity;
  const stopLossPnL = (stopLossPrice - buyPrice) * quantity;

  if (chartData.length === 0) return null;

  return (
    <div className="w-full h-full min-h-[300px] select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset={off} stopColor="#10b981" stopOpacity={0.2} />
              <stop offset={off} stopColor="#f43f5e" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="splitStroke" x1="0" y1="0" x2="0" y2="1">
               <stop offset={off} stopColor="#34d399" stopOpacity={1} />
               <stop offset={off} stopColor="#fb7185" stopOpacity={1} />
            </linearGradient>
          </defs>
          
          <XAxis 
            dataKey="price" 
            tickFormatter={(val) => `${val.toFixed(0)}`} 
            stroke="#4b5563"
            tick={{fontSize: 10, fill: '#6b7280'}}
            tickLine={false}
            axisLine={false}
            dy={10}
            minTickGap={30}
          />
          <YAxis hide={true} />
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '4 4' }} 
            isAnimationActive={false}
          />
          
          {/* Break Even Line */}
          <ReferenceLine 
            x={buyPrice} 
            stroke="#6b7280" 
            strokeDasharray="3 3" 
            label={{ value: 'ENTRY', position: 'insideTop', fill: '#6b7280', fontSize: 10 }}
          />

          {/* Stop Loss Line */}
          <ReferenceLine 
            x={stopLossPrice} 
            stroke="#f43f5e" 
            strokeDasharray="3 3" 
            opacity={0.6}
          />
          <ReferenceDot 
            x={stopLossPrice} 
            y={stopLossPnL} 
            r={5} 
            fill="#f43f5e" 
            stroke="#1f2937"
            strokeWidth={2}
          />
          
          {/* Main Area */}
          <Area
            type="monotone"
            dataKey="profit"
            stroke="url(#splitStroke)"
            fill="url(#splitColor)"
            strokeWidth={3}
            animationDuration={1000}
          />
          
          {/* Target Position Dot */}
          <ReferenceDot 
            x={sellPrice} 
            y={currentPnL} 
            r={6} 
            fill={currentPnL >= 0 ? '#10b981' : '#f43f5e'} 
            stroke="#fff"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PnLChart;