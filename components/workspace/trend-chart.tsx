"use client";
import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
export function TrendChart({
  data,
}: {
  data: { date: string; scans: number; incidents: number }[];
}) {
  const [range, setRange] = useState<7 | 30>(7);
  const shown = data.slice(-range);
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Activity trend</h3>
          <p className="mt-1 text-xs text-muted">
            AI requests and flagged events over time
          </p>
        </div>
        <div className="flex rounded-lg border border-line bg-ink/70 p-1">
          {([7, 30] as const).map((n) => (
            <button
              key={n}
              onClick={() => setRange(n)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${range === n ? "bg-surface text-white" : "text-muted"}`}
            >
              {n}D
            </button>
          ))}
        </div>
      </div>
      <div className="h-[270px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={shown}
            margin={{ left: -25, right: 8, top: 12, bottom: 0 }}
          >
            <defs>
              <linearGradient id="scanFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#41d5b0" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#41d5b0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="#25404c"
              strokeDasharray="3 5"
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "#91a6b0", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              minTickGap={22}
            />
            <YAxis
              tick={{ fill: "#91a6b0", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#102330",
                border: "1px solid #25404c",
                borderRadius: 10,
                color: "#e8f3f2",
              }}
            />
            <Area
              type="monotone"
              dataKey="scans"
              stroke="#41d5b0"
              fill="url(#scanFill)"
              strokeWidth={2.5}
            />
            <Area
              type="monotone"
              dataKey="incidents"
              stroke="#f5ba62"
              fill="transparent"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex gap-5 text-xs text-muted">
        <span className="flex items-center gap-2">
          <i className="h-2 w-2 rounded-full bg-accent" /> Requests scanned
        </span>
        <span className="flex items-center gap-2">
          <i className="h-2 w-2 rounded-full bg-amber" /> Flagged events
        </span>
      </div>
    </div>
  );
}
