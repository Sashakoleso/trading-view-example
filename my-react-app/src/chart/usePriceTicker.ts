import { useEffect, useState, useRef } from "react";

interface TickerData {
  symbol: string;
  price: number;
  direction: "up" | "down" | null;
  bidPrice: number;
  askPrice: number;
  volume: number;
  priceChangePercent: number;
}

export function usePriceTicker(symbols: string[]) {
  const [tickers, setTickers] = useState<Map<string, TickerData>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const lastPricesRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    let isMounted = true;
    // @ts-ignore
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Subscribe to all symbols' ticker
      const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
      const ws = new WebSocket(`wss://stream.binance.com/stream?streams=${streams}`);
      wsRef.current = ws;

      ws.onmessage = (evt) => {
        if (!isMounted) return;

        try {
          const data = JSON.parse(evt.data);
          const ticker = data.data;

          if (ticker && ticker.s && ticker.c) {
            const symbol = ticker.s.toLowerCase();
            const currentPrice = Number(ticker.c);
            const bidPrice = Number(ticker.b);
            const askPrice = Number(ticker.a);
            const volume = Number(ticker.v);
            const priceChangePercent = Number(ticker.P);
            const lastPrice = lastPricesRef.current.get(symbol);

            let direction: "up" | "down" | null = null;
            if (lastPrice !== undefined) {
              if (currentPrice > lastPrice) {
                direction = "up";
              } else if (currentPrice < lastPrice) {
                direction = "down";
              }
            }

            lastPricesRef.current.set(symbol, currentPrice);

            setTickers(prev => {
              const newMap = new Map(prev);
              const existing = prev.get(symbol);

              // Keep the existing direction if no change, or update if direction changed
              let finalDirection: "up" | "down" | null = existing?.direction || null;

              if (direction) {
                // Only update if direction actually changed or if there was no previous direction
                finalDirection = direction;
              }

              newMap.set(symbol, {
                symbol,
                price: currentPrice,
                direction: finalDirection,
                bidPrice,
                askPrice,
                volume,
                priceChangePercent
              });
              return newMap;
            });
          }
        } catch (error) {
          console.error("Failed to parse ticker message:", error);
        }
      };

      ws.onerror = () => {
        if (isMounted) {
          reconnectTimeout = setTimeout(() => {
            if (isMounted) connect();
          }, 3000);
        }
      };

      ws.onclose = () => {
        if (isMounted) {
          reconnectTimeout = setTimeout(() => {
            if (isMounted) connect();
          }, 3000);
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [symbols]);

  return tickers;
}
