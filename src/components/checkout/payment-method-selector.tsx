"use client";

import { Barcode, CreditCard, Wallet } from "lucide-react";
import { PixIcon } from "@/components/checkout/icons/pix-icon";
import type { PaymentMethodId } from "@/hooks/use-checkout";
import { cn } from "@/lib/utils";

interface PaymentMethodOption {
  id: PaymentMethodId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const METHODS: PaymentMethodOption[] = [
  { id: "card", label: "Cartão de crédito", icon: CreditCard },
  { id: "pix", label: "Pix", icon: PixIcon },
  { id: "pix_automatico", label: "Pix Automático", icon: PixIcon },
  { id: "boleto", label: "Boleto", icon: Barcode },
  { id: "wallet", label: "Carteira digital", icon: Wallet },
];

interface PaymentMethodSelectorProps {
  value: PaymentMethodId;
  onChange: (method: PaymentMethodId) => void;
  disabled?: boolean;
}

export function PaymentMethodSelector({ value, onChange, disabled }: PaymentMethodSelectorProps) {
  return (
    <div role="radiogroup" aria-label="Forma de pagamento" className="flex flex-col gap-2">
      {METHODS.map((method) => {
        const isActive = method.id === value;
        return (
          <button
            key={method.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => onChange(method.id)}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              isActive
                ? "border-primary bg-accent text-accent-foreground"
                : "border-border bg-card text-foreground hover:border-muted-foreground/30"
            )}
          >
            <method.icon className="size-5 shrink-0" />
            <span className="text-sm font-medium">{method.label}</span>
          </button>
        );
      })}
    </div>
  );
}
