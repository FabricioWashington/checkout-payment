"use client";

import { useCallback } from "react";

export function useHaptics() {
  const vibrate = useCallback((pattern: number | number[] = 20) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  return { vibrate };
}
