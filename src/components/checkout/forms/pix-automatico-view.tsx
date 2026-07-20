"use client";

import { useState } from "react";
import { Controller, type Control } from "react-hook-form";
import { PixIcon } from "@/components/checkout/icons/pix-icon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import type { PixAutomaticoConsentValues } from "@/lib/validation";
import { formatCentsToBRL } from "@/lib/plans";

interface PixAutomaticoViewProps {
  control: Control<PixAutomaticoConsentValues>;
  monthlyEquivalentCents: number;
  disabled?: boolean;
}

const BENEFITS = [
  "Cobrado automaticamente todo mês, sem precisar gerar novo código",
  "Cancele quando quiser direto no app do seu banco",
  "Você recebe um aviso antes de cada cobrança",
];

export function PixAutomaticoView({
  control,
  monthlyEquivalentCents,
  disabled,
}: PixAutomaticoViewProps) {
  const [generated, setGenerated] = useState(false);

  if (!generated) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-muted p-10 text-center">
        <PixIcon className="size-8 text-primary" />
        <p className="max-w-xs text-sm text-muted-foreground">
          Gere o QR Code para autorizar o débito automático no app do seu banco.
        </p>
        <Button type="button" onClick={() => setGenerated(true)}>
          Gerar QR Code
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <PixIcon className="size-4" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">Débito recorrente</p>
          <p className="font-heading text-lg font-semibold text-foreground">
            <span className="tabular-nums">{formatCentsToBRL(monthlyEquivalentCents)}</span>
            <span className="text-sm font-normal text-muted-foreground">/mês</span>
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex gap-2.5">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
            {benefit}
          </li>
        ))}
      </ul>

      <Controller
        control={control}
        name="consent"
        render={({ field, fieldState }) => (
          <Field orientation="horizontal" data-invalid={fieldState.invalid}>
            <Checkbox
              id="pix-automatico-consent"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              disabled={disabled}
            />
            <FieldContent>
              <FieldLabel htmlFor="pix-automatico-consent" className="font-normal">
                Autorizo o débito automático recorrente via PIX Automático até cancelar.
              </FieldLabel>
              <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
            </FieldContent>
          </Field>
        )}
      />
    </div>
  );
}
