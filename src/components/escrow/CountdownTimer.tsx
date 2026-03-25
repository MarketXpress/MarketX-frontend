"use client";

import { useState, useEffect } from "react";
import { Timer } from "lucide-react";

interface CountdownTimerProps {
  targetDate: string;
  label: string;
}

export default function CountdownTimer({ targetDate, label }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsExpired(true);
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 text-yellow-500 text-sm font-bold">
        <Timer className="w-4 h-4" /> {label}: Expired
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-wider">
        <Timer className="w-4 h-4 text-blue-400" /> {label}
      </div>
      <div className="flex gap-3">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="flex flex-col items-center">
            <div className="w-14 h-14 bg-black/60 border border-white/10 rounded-xl flex items-center justify-center text-xl font-black text-white tabular-nums">
              {String(value).padStart(2, "0")}
            </div>
            <span className="text-[10px] text-neutral-500 uppercase mt-1 font-bold">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
