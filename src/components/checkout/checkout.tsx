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
import { PaymentOutcome } from "@/components/checkout/payment-outcome";
import { CreditCard3D } from "@/components/checkout/credit-card-3d";
import { CardForm } from "@/components/checkout/forms/card-form";
import { PersonalDataForm } from "@/components/checkout/forms/personal-data-form";
import { useCheckout, type PaymentMethodId } from "@/hooks/use-checkout";
import { useCardPreview } from "@/hooks/use-card-preview";
import { PRO_PLAN, getPriceForCycle } from "@/lib/plans";
import { signatureTransition } from "@/lib/motion";
import {
  cardFormSchema,
  personalDataSchema,
  type CardFormValues,
  type PersonalDataValues,
} from "@/lib/validation";

const PAYMENT_SIMULATION_MS = 1800;

function getSubmitLabel(method: PaymentMethodId): string {
  switch (method) {
    case "pix":
      return "Pagar com Pix";
    case "pix_automatico":
      return "Autorizar Pix Automático";
    case "boleto":
      return "Gerar boleto";
    case "apple_pay":
      return "Pagar com Apple Pay";
    case "google_pay":
      return "Pagar com Google Pay";
    default:
      return "Finalizar pagamento";
  }
}

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
    if (state.method === "pix" || state.method === "pix_automatico") {
      actions.awaitPix();
      return;
    }
    if (state.method === "boleto") {
      actions.awaitBoleto();
      return;
    }
    actions.submitSuccess();
  }, [actions, devForceError, state.method]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isProcessing) return;

    const isPersonalValid = await personalForm.trigger();
    const isMethodValid = state.method === "card" ? await cardForm.trigger() : true;

    if (!isPersonalValid || !isMethodValid) return;
    await runPayment();
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-5xl items-center gap-2.5 px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex size-8 items-center justify-center rounded-lg bg-brand-navy text-white">
          <ShieldCheck className="size-4" />
        </div>
        <span className="font-heading text-sm font-semibold tracking-tight text-foreground">
          fabricio.washington.dev
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 lg:px-8 lg:py-12"
      >
        <div className="order-2 lg:order-1">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={state.step === "form" ? "form" : state.status}
              layout="position"
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={signatureTransition(0.35)}
            >
              {state.step === "outcome" ? (
                <PaymentOutcome
                  status={state.status}
                  method={state.method}
                  cycle={state.cycle}
                  amountCents={amountCents}
                  email={personalForm.getValues("email")}
                  errorMessage={state.errorMessage}
                  onConfirmPayment={actions.submitSuccess}
                  onRetry={actions.backToForm}
                  onReset={actions.reset}
                />
              ) : (
                <div className="flex flex-col gap-8">
                  <div>
                    <h2 className="mb-3 text-sm font-semibold text-foreground">
                      Forma de pagamento
                    </h2>
                    <PaymentMethodSelector
                      value={state.method}
                      onChange={actions.setMethod}
                      disabled={isProcessing}
                    />
                  </div>

                  {state.method === "card" && (
                    <CardForm
                      control={cardForm.control}
                      onUpdatePreview={updateCardPreview}
                      disabled={isProcessing}
                    />
                  )}

                  <div>
                    <h2 className="mb-3 text-sm font-semibold text-foreground">Dados pessoais</h2>
                    <PersonalDataForm control={personalForm.control} disabled={isProcessing} />
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button type="submit" size="lg" className="h-12 text-base">
                      {getSubmitLabel(state.method)}
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
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className="order-1 flex flex-col gap-6 lg:sticky lg:top-8 lg:order-2">
          <div className="flex flex-1 flex-col rounded-2xl border border-border bg-card p-6">
            <OrderSummary cycle={state.cycle} onCycleChange={actions.setCycle} />
          </div>
          <AnimatePresence>
            {state.method === "card" && (
              <motion.div
                key="credit-card-preview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={signatureTransition(0.3)}
              >
                <CreditCard3D preview={cardPreview} />
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </form>
    </main>
  );
}
