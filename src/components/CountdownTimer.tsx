"use client";

import { useState, useEffect } from "react";
import { formatCountdown } from "@/lib/utils";

interface CountdownTimerProps {
  initialMinutes?: number;
  variant?: "default" | "banner";
}

export default function CountdownTimer({
  initialMinutes = 15,
  variant = "default",
}: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(initialMinutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (variant === "banner") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-lg px-2.5 py-1">
        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        <span className="text-sm font-bold tabular-nums text-white">
          {formatCountdown(seconds)}
        </span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      <span className="text-sm font-medium text-red-700">
        Offer expires in{" "}
        <span className="font-bold tabular-nums">
          {formatCountdown(seconds)}
        </span>
      </span>
    </div>
  );
}
