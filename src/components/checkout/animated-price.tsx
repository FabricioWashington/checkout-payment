"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { EASE_SIGNATURE } from "@/lib/motion";
import { formatCentsToBRL } from "@/lib/plans";
import { cn } from "@/lib/utils";

interface AnimatedPriceProps {
  cents: number;
  className?: string;
}

export function AnimatedPrice({ cents, className }: AnimatedPriceProps) {
  const [displayCents, setDisplayCents] = useState(cents);
  const fromRef = useRef(cents);

  useEffect(() => {
    const controls = animate(fromRef.current, cents, {
      duration: 0.5,
      ease: EASE_SIGNATURE,
      onUpdate: (latest) => {
        fromRef.current = latest;
        setDisplayCents(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [cents]);

  return <span className={cn("tabular-nums", className)}>{formatCentsToBRL(displayCents)}</span>;
}
