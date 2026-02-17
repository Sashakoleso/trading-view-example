import type { Timeframe } from "./types";
import { TIMEFRAME_OPTIONS } from "./constants";

interface TimeframeSelectorProps {
  value: Timeframe;
  onChange: (timeframe: Timeframe) => void;
}

export const TimeframeSelector = ({ value, onChange }: TimeframeSelectorProps) => {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {TIMEFRAME_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          style={{
            padding: "4px 12px",
            fontSize: "12px",
            fontFamily: "system-ui",
            fontWeight: value === option.value ? 600 : 400,
            color: value !== option.value ? "#000" : "#fff",
            background: value === option.value ? "rgb(0,110,255)" : "rgba(148,163,184,0.05)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
