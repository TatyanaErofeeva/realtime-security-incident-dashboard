"use client";

import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useIncidentStore, type MetricSample } from "@/entities/IncidentStream";
import { readRecent } from "@/shared/lib/ringBuffer";
import styles from "./MetricsGrid.module.css";

const AXIS_TICK = { fill: "#7f948a", fontSize: 11 };
const TOOLTIP_STYLE = {
  background: "#141c19",
  border: "1px solid #24312c",
  borderRadius: 8,
  color: "#d7e4dc",
};

function formatSampleTime(timestamp: number): string {
  const date = new Date(timestamp);
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function MetricChart({
  title,
  dataKey,
  color,
  data,
}: {
  title: string;
  dataKey: keyof Pick<MetricSample, "threatLevel" | "cpuLoad" | "packetThrottle">;
  color: string;
  data: MetricSample[];
}) {
  return (
    <section className={styles.chart} aria-label={title}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <div className={styles.plot}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="rgba(215, 228, 220, 0.08)" vertical={false} />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(value) => formatSampleTime(Number(value))}
              tick={AXIS_TICK}
              stroke="#24312c"
              minTickGap={24}
            />
            <YAxis domain={[0, 100]} width={32} tick={AXIS_TICK} stroke="#24312c" />
            <Tooltip
              formatter={(value) => (typeof value === "number" ? value.toFixed(1) : String(value))}
              labelFormatter={(label) => formatSampleTime(Number(label))}
              contentStyle={TOOLTIP_STYLE}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              name={title}
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function MetricsGrid() {
  const metrics = useIncidentStore((state) => state.metrics);
  const data = useMemo(() => readRecent(metrics, metrics.size).reverse(), [metrics]);

  return (
    <div className={styles.grid}>
      <MetricChart title="Threat Level" dataKey="threatLevel" color="#ff5a36" data={data} />
      <MetricChart title="CPU Load" dataKey="cpuLoad" color="#8fd0ff" data={data} />
      <MetricChart title="Packet Throttling" dataKey="packetThrottle" color="#f5c16c" data={data} />
    </div>
  );
}
