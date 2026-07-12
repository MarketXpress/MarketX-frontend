"use client";

import React from "react";

export type StatTrend = "up" | "down" | "neutral";
export type StatCardVariant = "default" | "highlight" | "minimal";

export interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  change?: string;
  trend?: StatTrend;
  period?: string;
  icon?: React.ReactNode;
  variant?: StatCardVariant;
  className?: string;
}

function TrendArrow({ trend }: { trend: StatTrend }) {
  if (trend === "up")
    return (
      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 4l6 8H2z" />
      </svg>
    );
  if (trend === "down")
    return (
      <svg className="h-3.5 w-3.5 rotate-180" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 4l6 8H2z" />
      </svg>
    );
  return <span className="h-3.5 w-3.5 text-base leading-none">–</span>;
}

const trendColors: Record<StatTrend, string> = {
  up: "text-emerald-600",
  down: "text-rose-500",
  neutral: "text-slate-500",
};

export function StatCard({
  label,
  value,
  description,
  change,
  trend = "neutral",
  period,
  icon,
  variant = "default",
  className = "",
}: StatCardProps) {
  const isHighlight = variant === "highlight";
  const isMinimal = variant === "minimal";

  return (
    <div
      className={[
        "relative flex flex-col gap-3 rounded-2xl p-5",
        isHighlight
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
          : isMinimal
          ? "border-b border-slate-200 pb-4"
          : "border border-slate-200 bg-white shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="stat-card"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={[
            "text-xs font-semibold uppercase tracking-wide",
            isHighlight ? "text-indigo-200" : "text-slate-500",
          ].join(" ")}
        >
          {label}
        </span>
        {icon && (
          <span
            className={[
              "flex h-8 w-8 items-center justify-center rounded-xl text-sm",
              isHighlight ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600",
            ].join(" ")}
          >
            {icon}
          </span>
        )}
      </div>

      <span
        className={[
          "text-3xl font-bold tabular-nums leading-none",
          isHighlight ? "text-white" : "text-slate-900",
        ].join(" ")}
      >
        {value}
      </span>

      {(change !== undefined || description) && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {change !== undefined && (
            <span
              className={[
                "flex items-center gap-0.5 font-semibold",
                isHighlight ? "text-white" : trendColors[trend],
              ].join(" ")}
            >
              <TrendArrow trend={trend} />
              {change}
            </span>
          )}
          {period && (
            <span className={isHighlight ? "text-indigo-200" : "text-slate-400"}>{period}</span>
          )}
          {description && (
            <span className={isHighlight ? "text-indigo-100" : "text-slate-500"}>{description}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default StatCard;