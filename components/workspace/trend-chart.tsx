"use client";

import dynamic from "next/dynamic";

export const TrendChart = dynamic(
  () => import("./trend-chart-impl").then((mod) => mod.TrendChart),
  {
    ssr: false,
    loading: () => <div className="h-[350px] animate-pulse rounded-xl bg-surface/40" />,
  },
);
