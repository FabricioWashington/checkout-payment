"use client";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AnimatedPrice } from "@/components/checkout/animated-price";
import type { BillingCycle } from "@/lib/plans";
import {
  PRO_PLAN,
  getAnnualMonthlyEquivalentCents,
  getAnnualSavingsPercent,
  getPriceForCycle,
} from "@/lib/plans";

interface OrderSummaryProps {
  cycle: BillingCycle;
  onCycleChange: (cycle: BillingCycle) => void;
}

export function OrderSummary({ cycle, onCycleChange }: OrderSummaryProps) {
  const isAnnual = cycle === "annual";
  const priceCents = getPriceForCycle(PRO_PLAN, cycle);
  const savingsPercent = getAnnualSavingsPercent(PRO_PLAN);
  const displayCents = isAnnual ? getAnnualMonthlyEquivalentCents(PRO_PLAN) : priceCents;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Checkout
        </p>
        <h1 className="font-heading text-xl font-semibold text-foreground">Resumo da compra</h1>
      </div>

      <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
        <div>
          <p className="font-medium text-foreground">Plano {PRO_PLAN.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{PRO_PLAN.tagline}</p>
        </div>
        <p className="shrink-0 font-medium text-foreground tabular-nums">
          {(priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-3">
        <Label htmlFor="cycle-switch" className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">Cobrança anual</span>
          <span className="text-xs text-muted-foreground">
            {isAnnual ? "Equivale ao valor mensal abaixo" : "Ative e economize"}
          </span>
        </Label>
        <div className="flex items-center gap-2">
          {savingsPercent > 0 && (
            <Badge className="bg-primary/10 text-primary">-{savingsPercent}%</Badge>
          )}
          <Switch
            id="cycle-switch"
            checked={isAnnual}
            onCheckedChange={(checked) => onCycleChange(checked ? "annual" : "monthly")}
          />
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Subtotal</span>
          <AnimatedPrice cents={displayCents} className="tabular-nums" />
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Frete</span>
          <span>Não se aplica</span>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <span className="font-medium text-foreground">Total a pagar</span>
        <AnimatedPrice
          cents={displayCents}
          className="font-heading text-2xl font-semibold text-foreground"
        />
      </div>
      <p className="-mt-4 text-xs text-muted-foreground">
        {isAnnual ? "Cobrado uma vez por ano" : "Cobrado mensalmente"}
      </p>
    </div>
  );
}
