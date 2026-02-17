import { useEffect, useRef } from "react";
import { ColorType, createChart, CandlestickSeries, type IChartApi, type CandlestickData } from "lightweight-charts";
import { DEFAULT_CHART_OPTIONS, DEFAULT_CANDLESTICK_OPTIONS } from "./constants";
import "./chart.css";

interface ChartProps {
  data: CandlestickData[];
  height: number;
  onResetView?: () => void;
}

export const Chart = ({ data, height, onResetView }: ChartProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ReturnType<IChartApi["addSeries"]> | null>(null);

  const resetView = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
      onResetView?.();
    }
  };

  // Create chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      ...DEFAULT_CHART_OPTIONS,
      height,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#cbd5e1",
      },
    });

    const series = chart.addSeries(CandlestickSeries, DEFAULT_CANDLESTICK_OPTIONS);

    chartRef.current = chart;
    seriesRef.current = series;

    // Handle resize
    const ro = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height]);

  // Update data
  useEffect(() => {
    if (!seriesRef.current || !data.length) return;

    seriesRef.current.setData(data);
  }, [data]);

  return (
    <div className="chart-wrapper">
      <div ref={containerRef} className="chart-container" style={{ height }} />
      <button onClick={resetView} className="chart-reset-button">
        Reset View
      </button>
    </div>
  );
};
