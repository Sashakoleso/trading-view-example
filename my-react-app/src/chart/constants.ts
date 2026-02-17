import type { TimeframeOption } from "./types";

export const BINANCE_WS_BASE = "wss://stream.binance.com/ws";

export const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { value: "1s", label: "1s", category: "seconds" },
  { value: "1m", label: "1m", category: "minutes" },
  { value: "5m", label: "5m", category: "minutes" },
  { value: "15m", label: "15m", category: "minutes" },
  { value: "1h", label: "1h", category: "hours" },
  { value: "6h", label: "6h", category: "hours" },
  { value: "8h", label: "8h", category: "hours" },
  { value: "12h", label: "12h", category: "hours" },
  { value: "1d", label: "1d", category: "days" },
  { value: "3d", label: "3d", category: "days" },
  { value: "1w", label: "1w", category: "weeks" },
  { value: "1M", label: "1M", category: "months" },
];

export const CURRENCIES = ["btcusdt", "ethusdt", "bnbusdt", "solusdt", "xrpusdt", "adausdt"];

export const DEFAULT_CHART_OPTIONS = {
  layout: {
    background: { type: "solid" as const, color: "transparent" },
    textColor: "#cbd5e1",
  },
  grid: {
    vertLines: { color: "rgba(148,163,184,0.12)" },
    horzLines: { color: "rgba(148,163,184,0.12)" },
  },
  timeScale: {
    timeVisible: true,
    secondsVisible: false
  },
  rightPriceScale: {
    borderVisible: false,
    autoScale: true,
  },
  crosshair: { mode: 1 as const },
};

export const DEFAULT_CANDLESTICK_OPTIONS = {
  upColor: "#22c55e",
  downColor: "#ef4444",
  borderVisible: false,
  wickUpColor: "#22c55e",
  wickDownColor: "#ef4444",
};

export const STORAGE_KEY_PREFIX = "chart_data_";
export const MAX_STORED_CANDLES = 1000;
export const STORAGE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
