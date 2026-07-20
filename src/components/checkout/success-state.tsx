"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { useHaptics } from "@/hooks/use-haptics";
import { formatCentsToBRL } from "@/lib/plans";
import { signatureTransition } from "@/lib/motion";

interface SuccessStateProps {
  amountCents: number;
  onReset: () => void;
}

export function SuccessState({ amountCents, onReset }: SuccessStateProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { vibrate } = useHaptics();
  const hasCelebratedRef = useRef(false);

  useEffect(() => {
    if (hasCelebratedRef.current) return;
    hasCelebratedRef.current = true;
    vibrate([20, 40, 20]);
    if (prefersReducedMotion) return;
    confetti({
      particleCount: 120,
      spread: 80,
      startVelocity: 40,
      origin: { y: 0.6 },
      colors: ["#65C689", "#0A2154", "#3E7A54"],
    });
  }, [prefersReducedMotion, vibrate]);

  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-primary/15">
        <svg viewBox="0 0 52 52" className="size-10" fill="none">
          <motion.circle
            cx="26"
            cy="26"
            r="24"
            stroke="var(--color-brand-green-dark)"
            strokeWidth="2.5"
            initial={prefersReducedMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={signatureTransition(0.6)}
          />
          <motion.path
            d="M15 27l7 7 15-15"
            stroke="var(--color-brand-green-dark)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={prefersReducedMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={signatureTransition(0.5, 0.4)}
          />
        </svg>
      </div>

      <div>
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          Assinatura confirmada!
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Cobramos{" "}
          <span className="font-medium text-foreground">{formatCentsToBRL(amountCents)}</span> e
          enviamos os detalhes para o seu e-mail.
        </p>
      </div>

      <Button variant="outline" onClick={onReset}>
        Simular nova assinatura
      </Button>
    </div>
  );
}
