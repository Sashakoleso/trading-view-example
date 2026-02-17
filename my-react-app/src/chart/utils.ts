import type { CandlestickData, UTCTimestamp } from "lightweight-charts";
import type { BinanceKlineMessage, StoredCandleData, Timeframe } from "./types";
import { BINANCE_WS_BASE, STORAGE_KEY_PREFIX, MAX_STORED_CANDLES, STORAGE_EXPIRY_MS } from "./constants";

/**
 * Generates the Binance WebSocket URL for a given symbol and interval
 */
export function getKlineUrl(symbol: string, interval: string): string {
  return `${BINANCE_WS_BASE}/${symbol.toLowerCase()}@kline_${interval}`;
}

/**
 * Converts Binance kline data to CandlestickData format
 */
export function parseBinanceKline(msg: BinanceKlineMessage): CandlestickData | null {
  const k = msg.k;
  if (!k) return null;

  return {
    time: Math.floor(k.t / 1000) as UTCTimestamp,
    open: Number(k.o),
    high: Number(k.h),
    low: Number(k.l),
    close: Number(k.c),
  };
}

/**
 * Generates a storage key for a specific symbol and interval
 */
export function getStorageKey(symbol: string, interval: Timeframe): string {
  return `${STORAGE_KEY_PREFIX}${symbol}_${interval}`;
}

/**
 * Saves candle data to localStorage
 */
export function saveCandleData(
  symbol: string,
  interval: Timeframe,
  candles: CandlestickData[]
): void {
  try {
    const data: StoredCandleData = {
      symbol,
      interval,
      candles: candles.slice(-MAX_STORED_CANDLES), // Keep only the last N candles
      lastUpdate: Date.now(),
    };
    localStorage.setItem(getStorageKey(symbol, interval), JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to save candle data to localStorage:", error);
  }
}

/**
 * Loads candle data from localStorage
 */
export function loadCandleData(
  symbol: string,
  interval: Timeframe
): CandlestickData[] | null {
  try {
    const key = getStorageKey(symbol, interval);
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const data: StoredCandleData = JSON.parse(stored);

    // Check if data is expired
    if (Date.now() - data.lastUpdate > STORAGE_EXPIRY_MS) {
      localStorage.removeItem(key);
      return null;
    }

    // Verify the data matches the requested symbol and interval
    if (data.symbol !== symbol || data.interval !== interval) {
      return null;
    }

    return data.candles;
  } catch (error) {
    console.warn("Failed to load candle data from localStorage:", error);
    return null;
  }
}

/**
 * Clears all stored candle data from localStorage
 */
export function clearAllCandleData(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn("Failed to clear candle data:", error);
  }
}

/**
 * Merges new candle with existing candles array
 * Updates the last candle if timestamps match, otherwise appends
 */
export function mergeCandle(
  candles: CandlestickData[],
  newCandle: CandlestickData
): CandlestickData[] {
  if (candles.length === 0) {
    return [newCandle];
  }

  const lastCandle = candles[candles.length - 1];

  // If the new candle has the same timestamp, update the last candle
  if (lastCandle.time === newCandle.time) {
    return [...candles.slice(0, -1), newCandle];
  }

  // Otherwise, append the new candle
  return [...candles, newCandle];
}

/**
 * Fetches historical kline data from Binance REST API
 */
export async function fetchHistoricalCandles(
  symbol: string,
  interval: Timeframe,
  limit: number = 500
): Promise<CandlestickData[]> {
  try {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch historical data: ${response.statusText}`);
    }

    const data = await response.json();

    // Binance klines format: [openTime, open, high, low, close, volume, closeTime, ...]
    return data.map((kline: any[]) => ({
      time: Math.floor(kline[0] / 1000) as UTCTimestamp,
      open: Number(kline[1]),
      high: Number(kline[2]),
      low: Number(kline[3]),
      close: Number(kline[4]),
    }));
  } catch (error) {
    console.error("Failed to fetch historical candles:", error);
    return [];
  }
}
