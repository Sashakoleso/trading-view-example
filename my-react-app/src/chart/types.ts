import type { CandlestickData } from "lightweight-charts";

export type Timeframe = "1s" | "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "6h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M";

export interface ChartProps {
  symbol?: string;
  interval?: Timeframe;
  height?: number;
}

export interface BinanceKlineMessage {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  k: {
    t: number; // Kline start time
    T: number; // Kline close time
    s: string; // Symbol
    i: string; // Interval
    f: number; // First trade ID
    L: number; // Last trade ID
    o: string; // Open price
    c: string; // Close price
    h: string; // High price
    l: string; // Low price
    v: string; // Base asset volume
    n: number; // Number of trades
    x: boolean; // Is this kline closed?
    q: string; // Quote asset volume
    V: string; // Taker buy base asset volume
    Q: string; // Taker buy quote asset volume
    B: string; // Ignore
  };
}

export interface StoredCandleData {
  symbol: string;
  interval: Timeframe;
  candles: CandlestickData[];
  lastUpdate: number;
}

export interface TimeframeOption {
  value: Timeframe;
  label: string;
  category: "seconds" | "minutes" | "hours" | "days" | "weeks" | "months";
}
