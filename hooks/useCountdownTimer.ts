import { useEffect, useState } from "react";

/**
 * Custom hook to manage a countdown timer.
 * @param initialSeconds - The initial number of seconds for the countdown.
 * @returns The current number of seconds remaining.
 */
export function useCountdownTimer(
  initialSeconds: number
): [number, (seconds: number) => void] {
  const [seconds, setSeconds] = useState<number>(initialSeconds);

  useEffect(() => {
    if (seconds === 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  return [seconds, setSeconds];
}
