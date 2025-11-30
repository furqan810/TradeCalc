import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clean up previous script if it exists
    if (container.current) {
      container.current.innerHTML = '';
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    // TradingView generally expects "EXCHANGE:SYMBOL" format, but works with just "SYMBOL" often.
    // We try to ensure it looks like a symbol.
    const cleanSymbol = symbol ? symbol.toUpperCase() : "BTCUSDT";

    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": cleanSymbol,
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "backgroundColor": "rgba(3, 7, 18, 1)", // Matches gray-950
      "gridColor": "rgba(255, 255, 255, 0.05)",
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": false,
      "calendar": false,
      "hide_volume": true,
      "support_host": "https://www.tradingview.com"
    });

    if (container.current) {
      const widgetContainer = document.createElement("div");
      widgetContainer.className = "tradingview-widget-container__widget";
      widgetContainer.style.height = "100%";
      widgetContainer.style.width = "100%";
      container.current.appendChild(widgetContainer);
      container.current.appendChild(script);
    }
  }, [symbol]);

  return (
    <div 
      className="tradingview-widget-container h-full w-full rounded-xl overflow-hidden border border-white/5" 
      ref={container} 
    />
  );
}

export default memo(TradingViewWidget);