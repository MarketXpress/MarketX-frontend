"use client";

import React, { useState } from "react";

export interface SubnavItem {
  key: string;
  label: string;
  badge?: number;
  disabled?: boolean;
  icon?: React.ReactNode;
  href?: string;
}

export interface DashboardSubnavProps {
  items: SubnavItem[];
  activeKey?: string;
  onChange?: (key: string) => void;
  title?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function DashboardSubnav({
  items,
  activeKey,
  onChange,
  title,
  actions,
  className = "",
}: DashboardSubnavProps) {
  return (
    <nav
      className={[
        "flex items-center gap-0 border-b border-slate-200 bg-white",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Dashboard navigation"
      data-testid="dashboard-subnav"
    >
      {title && (
        <span className="mr-6 shrink-0 text-sm font-semibold text-slate-700 pl-4">
          {title}
        </span>
      )}
      <div className="flex min-w-0 flex-1 overflow-x-auto scrollbar-none">
        <ul className="flex" role="tablist">
          {items.map((item) => {
            const isActive = item.key === activeKey;
            return (
              <li key={item.key} role="presentation">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-disabled={item.disabled}
                  disabled={item.disabled}
                  onClick={() => !item.disabled && onChange?.(item.key)}
                  className={[
                    "relative flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-sm font-medium",
                    "outline-none transition-colors duration-150",
                    "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
                    isActive
                      ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600"
                      : "text-slate-500 hover:text-slate-800",
                    item.disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {item.icon && (
                    <span className="h-4 w-4 shrink-0">{item.icon}</span>
                  )}
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={[
                        "ml-1 rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none",
                        isActive
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-100 text-slate-600",
                      ].join(" ")}
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {actions && (
        <div className="ml-auto flex shrink-0 items-center gap-2 pr-4">{actions}</div>
      )}
    </nav>
  );
}

export function DashboardSubnavControlled(
  props: Omit<DashboardSubnavProps, "activeKey" | "onChange"> & { defaultActiveKey?: string }
) {
  const [activeKey, setActiveKey] = useState(
    props.defaultActiveKey ?? props.items[0]?.key
  );
  return (
    <DashboardSubnav {...props} activeKey={activeKey} onChange={setActiveKey} />
  );
}

export default DashboardSubnav;