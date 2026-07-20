"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { OrderSummary } from "@/components/checkout/order-summary";
import { PaymentMethodSelector } from "@/components/checkout/payment-method-selector";
import { PaymentErrorBanner } from "@/components/checkout/payment-error-banner";
import { SuccessState } from "@/components/checkout/success-state";
import { CreditCard3D } from "@/components/checkout/credit-card-3d";
import { CardForm } from "@/components/checkout/forms/card-form";
import { PixView } from "@/components/checkout/forms/pix-view";
import { PixAutomaticoView } from "@/components/checkout/forms/pix-automatico-view";
import { BoletoView } from "@/components/checkout/forms/boleto-view";
import { WalletButtons } from "@/components/checkout/forms/wallet-buttons";
import { PersonalDataForm } from "@/components/checkout/forms/personal-data-form";
import { useCheckout } from "@/hooks/use-checkout";
import { useCardPreview } from "@/hooks/use-card-preview";
import { PRO_PLAN, getPriceForCycle } from "@/lib/plans";
import { signatureTransition } from "@/lib/motion";
import {
  cardFormSchema,
  personalDataSchema,
  pixAutomaticoConsentSchema,
  type CardFormValues,
  type PersonalDataValues,
  type PixAutomaticoConsentValues,
} from "@/lib/validation";

const PAYMENT_SIMULATION_MS = 1800;

export function Checkout() {
  const { state, actions } = useCheckout();
  const { preview: cardPreview, updatePreview: updateCardPreview } = useCardPreview();
  const [devForceError, setDevForceError] = useState(false);
  const isProcessing = state.status === "processing";

  const personalForm = useForm<PersonalDataValues>({
    resolver: zodResolver(personalDataSchema),
    defaultValues: { email: "", fullName: "", document: "", phone: "" },
    mode: "onBlur",
  });
  const cardForm = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: { cardNumber: "", cardName: "", expiry: "", cvv: "" },
    mode: "onBlur",
  });
  const pixAutoForm = useForm<PixAutomaticoConsentValues>({
    resolver: zodResolver(pixAutomaticoConsentSchema),
    defaultValues: { consent: false },
  });

  const amountCents =
    state.method === "pix_automatico"
      ? PRO_PLAN.monthlyPriceCents
      : getPriceForCycle(PRO_PLAN, state.cycle);

  const runPayment = useCallback(async () => {
    actions.submitStart();
    await new Promise((resolve) => setTimeout(resolve, PAYMENT_SIMULATION_MS));
    if (devForceError) {
      actions.submitError(
        "Não foi possível confirmar seu pagamento. Verifique os dados e tente novamente."
      );
      return;
    }
    actions.submitSuccess();
  }, [actions, devForceError]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isProcessing) return;

    const isPersonalValid = await personalForm.trigger();
    const isMethodValid =
      state.method === "card"
        ? await cardForm.trigger()
        : state.method === "pix_automatico"
          ? await pixAutoForm.trigger()
          : true;

    if (!isPersonalValid || !isMethodValid) return;
    await runPayment();
  }

  if (state.step === "success") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
          <SuccessState amountCents={amountCents} onReset={actions.reset} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-5xl items-center gap-2.5 px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex size-8 items-center justify-center rounded-lg bg-brand-navy text-white">
          <ShieldCheck className="size-4" />
        </div>
        <span className="font-heading text-sm font-semibold tracking-tight text-foreground">
          Nebula
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-10 lg:px-8 lg:py-12"
      >
        <div className="order-2 flex flex-col gap-8 lg:order-1">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">Forma de pagamento</h2>
            <PaymentMethodSelector
              value={state.method}
              onChange={actions.setMethod}
              disabled={isProcessing}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={state.method}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={signatureTransition(0.3)}
              className="flex flex-col gap-6"
            >
              {state.method === "card" && (
                <>
                  <div className="max-w-sm">
                    <CreditCard3D preview={cardPreview} />
                  </div>
                  <CardForm
                    control={cardForm.control}
                    onUpdatePreview={updateCardPreview}
                    disabled={isProcessing}
                  />
                </>
              )}
              {state.method === "pix" && <PixView />}
              {state.method === "pix_automatico" && (
                <PixAutomaticoView
                  control={pixAutoForm.control}
                  monthlyEquivalentCents={PRO_PLAN.monthlyPriceCents}
                  disabled={isProcessing}
                />
              )}
              {state.method === "boleto" && <BoletoView />}
              {state.method === "wallet" && <WalletButtons />}
            </motion.div>
          </AnimatePresence>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">Dados pessoais</h2>
            <PersonalDataForm control={personalForm.control} disabled={isProcessing} />
          </div>

          {state.status === "error" && state.errorMessage && (
            <PaymentErrorBanner message={state.errorMessage} />
          )}

          <div className="flex flex-col gap-3">
            <Button type="submit" size="lg" className="h-12 text-base" disabled={isProcessing}>
              {isProcessing ? "Confirmando pagamento..." : "Finalizar pagamento"}
            </Button>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="size-3.5" />
              Pagamento protegido
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <Label htmlFor="dev-force-error" className="text-xs text-muted-foreground">
              Simular falha no pagamento (dev)
            </Label>
            <Switch
              id="dev-force-error"
              checked={devForceError}
              onCheckedChange={setDevForceError}
            />
          </div>
        </div>

        <aside className="order-1 rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-8 lg:order-2">
          <OrderSummary cycle={state.cycle} onCycleChange={actions.setCycle} />
        </aside>
      </form>
    </main>
  );
}
