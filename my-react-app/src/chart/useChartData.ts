import { useEffect, useRef, useState } from "react";
import type { CandlestickData } from "lightweight-charts";
import type { BinanceKlineMessage, Timeframe } from "./types";
import { getKlineUrl, parseBinanceKline, saveCandleData, mergeCandle, fetchHistoricalCandles } from "./utils";

interface UseChartDataOptions {
  symbol: string;
  interval: Timeframe;
  enabled?: boolean;
}

export function useChartData({ symbol, interval, enabled = true }: UseChartDataOptions) {
  const [candles, setCandles] = useState<CandlestickData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [priceDirection, setPriceDirection] = useState<"up" | "down" | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const lastPriceRef = useRef<number | null>(null);

  // Load data from localStorage or fetch historical data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
        const historicalCandles = await fetchHistoricalCandles(symbol, interval);
        setCandles(historicalCandles);
        setIsLoading(false);
    };

    loadData();
  }, [symbol, interval]);

  // Save candles to localStorage whenever they change
  useEffect(() => {
    if (candles.length > 0) {
      saveCandleData(symbol, interval, candles);
    }
  }, [candles, symbol, interval]);

  // WebSocket connection
  useEffect(() => {
    if (!enabled) {
      setIsConnected(false);
      return;
    }

    // @ts-ignore
    let reconnectTimeout: NodeJS.Timeout;
    let isMounted = true;
    let currentWs: WebSocket | null = null;

    const connect = () => {
      // Close previous connection if any
      if (currentWs) {
        currentWs.onclose = null; // Remove handler to prevent reconnect
        currentWs.close();
        currentWs = null;
      }

      const ws = new WebSocket(getKlineUrl(symbol, interval));
      currentWs = ws;
      wsRef.current = ws;

      ws.onopen = () => {
        if (isMounted) {
          setIsConnected(true);
        }
      };

      ws.onmessage = (evt) => {
        if (!isMounted) return;

        try {
          const msg: BinanceKlineMessage = JSON.parse(evt.data);
          const candle = parseBinanceKline(msg);

          if (candle) {
            // Track price direction
            if (lastPriceRef.current !== null) {
              if (candle.close > lastPriceRef.current) {
                setPriceDirection("up");
              } else if (candle.close < lastPriceRef.current) {
                setPriceDirection("down");
              }
            }
            lastPriceRef.current = candle.close;

            setCandles((prev) => mergeCandle(prev, candle));
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        if (isMounted) {
          setIsConnected(false);
        }
      };

      ws.onclose = () => {
        if (!isMounted) return;

        setIsConnected(false);

        // Attempt to reconnect after 3 seconds
        reconnectTimeout = setTimeout(() => {
          if (isMounted) {
            connect();
          }
        }, 3000);
      };
    };

    connect();

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimeout);
      setIsConnected(false);

      if (currentWs) {
        currentWs.onclose = null; // Prevent reconnect on cleanup
        currentWs.close();
        currentWs = null;
      }
      wsRef.current = null;
    };
  }, [symbol, interval, enabled]);

  return {
    candles,
    isConnected,
    isLoading,
    priceDirection,
    setCandles,
  };
}
