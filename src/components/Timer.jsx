"use client";

import { Clock3 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function Timer({ durationSeconds, label, onExpire, compact = false }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    expiredRef.current = false;

    if (!durationSeconds || durationSeconds < 1) return;

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((elapsed) => Math.min(elapsed + 1, durationSeconds));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [durationSeconds]);

  const remaining = Math.max(0, durationSeconds - elapsedSeconds);

  useEffect(() => {
    if (remaining !== 0 || !durationSeconds || expiredRef.current) return;
    expiredRef.current = true;
    onExpireRef.current?.();
  }, [durationSeconds, remaining]);

  const urgent = remaining <= 60;

  return (
    <div className={`inline-flex items-center gap-2 ${urgent ? "text-red-700" : "text-slate-800"}`}>
      <Clock3 aria-hidden="true" className="h-4 w-4" />
      {!compact && <span className="text-xs font-medium text-slate-500">{label}</span>}
      <time className="font-mono text-sm font-semibold tabular-nums" dateTime={`PT${remaining}S`}>
        {formatTime(remaining)}
      </time>
    </div>
  );
}