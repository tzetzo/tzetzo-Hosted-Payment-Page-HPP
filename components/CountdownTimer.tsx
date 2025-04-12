"use client";

import { useCountdownTimer } from "@/hooks/useCountdownTimer";
import { formatTime } from "@/helpers/format-time";

interface CountdownTimerProps {
  initialSeconds: number;
  onSetSeconds: (setSeconds: (seconds: number) => void) => void;
}

export default function CountdownTimer({
  initialSeconds,
  onSetSeconds,
}: CountdownTimerProps) {
  const [seconds, setSeconds] = useCountdownTimer(initialSeconds);

  // Expose the setSeconds function to the parent component
  onSetSeconds(setSeconds);

  return <span className="font-mono">{formatTime(seconds ?? 0)}</span>;
}
