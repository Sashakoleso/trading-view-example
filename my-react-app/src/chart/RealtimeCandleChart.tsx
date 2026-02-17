import {useState, useMemo} from "react";
import type {ChartProps, Timeframe} from "./types";
import {Chart} from "./Chart";
import {TimeframeSelector} from "./TimeframeSelector";
import {useChartData} from "./useChartData";
import {usePriceTicker} from "./usePriceTicker";
import "./chart.css";
import {CURRENCIES} from "./constants";

export const RealtimeCandleChart = ({
                                      symbol = "btcusdt",
                                      interval = "1m",
                                      height = 700,
                                    }: ChartProps) => {
  const [selectedSymbol, setSelectedSymbol] = useState(symbol);
  const [selectedInterval, setSelectedInterval] = useState<Timeframe>(interval);
  const {candles, isConnected, isLoading} = useChartData({
    symbol: selectedSymbol,
    interval: selectedInterval,
  });
  const tickers = usePriceTicker(CURRENCIES);
  const title = useMemo(
    () => `${selectedSymbol.toUpperCase()} • ${selectedInterval}`,
    [selectedSymbol, selectedInterval]
  );

  const statusClass = isLoading ? "loading" : isConnected ? "connected" : "disconnected";
  const statusText = isLoading ? "● loading..." : isConnected ? "● Realtime" : "● disconnected";

  return (
    <div>
      <table className="screener-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Last</th>
            <th>Bid</th>
            <th>ask</th>
            <th>Volume</th>
            <th>Chg%</th>
          </tr>
        </thead>
        <tbody>
          {CURRENCIES.map((curr) => {
            const isActive = curr === selectedSymbol;
            const ticker = tickers.get(curr);
            const direction = ticker?.direction;

            return (
              <tr
                key={curr}
                onClick={() => setSelectedSymbol(curr)}
                className={`screener-row ${isActive ? "active" : ""}`}
              >
                <td className="symbol-cell">{curr.replace("usdt", "").toUpperCase()}</td>
                <td className={`price-cell ${direction || ""}`}>
                  {ticker?.price.toFixed(2) || "-"}
                </td>
                <td>{ticker?.bidPrice.toFixed(2) || "-"}</td>
                <td>{ticker?.askPrice.toFixed(2) || "-"}</td>
                <td>{ticker?.volume ? ticker.volume.toFixed(0) : "-"}</td>
                <td className={`change-cell ${direction || ""}`}>
                  {ticker?.priceChangePercent !== undefined
                    ? `${ticker.priceChangePercent > 0 ? "+" : ""}${ticker.priceChangePercent.toFixed(2)}%`
                    : "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="chart-header">
        <div className="chart-title">
          <b>{title}</b>
          <span className={`chart-status ${statusClass}`}>
            {statusText}
          </span>
        </div>
        <TimeframeSelector
          value={selectedInterval}
          onChange={setSelectedInterval}
        />
      </div>
      <Chart data={candles} height={height}/>
    </div>
  );
};
