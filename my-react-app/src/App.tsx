import { RealtimeCandleChart } from "./chart";

export const App =  () => {
  return (
    <div style={{ padding: 20, margin: "0 auto" }}>
      <RealtimeCandleChart symbol="btcusdt" interval="1m" height={700} />
    </div>
  );
};