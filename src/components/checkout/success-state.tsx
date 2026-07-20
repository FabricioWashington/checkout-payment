"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { useHaptics } from "@/hooks/use-haptics";
import { formatCentsToBRL, PRO_PLAN, type BillingCycle } from "@/lib/plans";
import { signatureTransition } from "@/lib/motion";

interface SuccessStateProps {
  amountCents: number;
  cycle: BillingCycle;
  email: string;
  onReset: () => void;
}

function getNextBillingDate(cycle: BillingCycle): string {
  const date = new Date();
  if (cycle === "annual") {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export function SuccessState({ amountCents, cycle, email, onReset }: SuccessStateProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { vibrate } = useHaptics();
  const hasCelebratedRef = useRef(false);
  const [transactionId] = useState(() => Math.random().toString(36).slice(2, 10).toUpperCase());

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
    <div className="flex flex-col items-center gap-6 py-2 text-center">
      <div className="relative flex size-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-primary/10" />
        <svg viewBox="0 0 52 52" className="relative size-10" fill="none">
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
        <p className="mt-1.5 text-sm text-muted-foreground">
          Seu plano {PRO_PLAN.name} já está ativo.
        </p>
      </div>

      <div className="w-full max-w-xs rounded-xl border border-dashed border-border p-4 text-left">
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Valor cobrado</dt>
            <dd className="font-mono font-medium tabular-nums text-foreground">
              {formatCentsToBRL(amountCents)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Próxima cobrança</dt>
            <dd className="font-medium text-foreground">{getNextBillingDate(cycle)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">Recibo enviado</dt>
            <dd className="truncate font-medium text-foreground">{email || "para seu e-mail"}</dd>
          </div>
        </dl>
        <div className="mt-3 border-t border-dashed border-border pt-2.5 text-center">
          <span className="font-mono text-xs text-muted-foreground">#{transactionId}</span>
        </div>
      </div>

      <Button type="button" variant="outline" onClick={onReset}>
        Simular nova assinatura
      </Button>
    </div>
  );
}
