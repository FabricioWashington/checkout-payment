"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PixIcon } from "@/components/checkout/icons/pix-icon";
import { SuccessState } from "@/components/checkout/success-state";
import { PaymentErrorBanner } from "@/components/checkout/payment-error-banner";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { PaymentMethodId, PaymentStatus } from "@/hooks/use-checkout";
import type { BillingCycle } from "@/lib/plans";
import { signatureTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

const PIX_PAYLOAD =
  "00020126580014BR.GOV.BCB.PIX0136a629534e-7693-4846-b028-f142082d7b70520400005303986540510.005802BR5913Nebula Assinaturas6008Sao Paulo62070503***6304E2CA";
const BOLETO_CODE = "34191.79001 01043.510047 91020.150008 8 96780026000";
const COUNTDOWN_SECONDS = 15 * 60;

interface PaymentOutcomeProps {
  status: PaymentStatus;
  method: PaymentMethodId;
  cycle: BillingCycle;
  amountCents: number;
  email: string;
  errorMessage: string | null;
  onConfirmPayment: () => void;
  onRetry: () => void;
  onReset: () => void;
}

export function PaymentOutcome({
  status,
  method,
  cycle,
  amountCents,
  email,
  errorMessage,
  onConfirmPayment,
  onRetry,
  onReset,
}: PaymentOutcomeProps) {
  if (status === "processing") {
    return <ProcessingOutcome />;
  }

  if (status === "awaiting_pix") {
    return <PixOutcome automatic={method === "pix_automatico"} onConfirmPayment={onConfirmPayment} />;
  }

  if (status === "awaiting_boleto") {
    return <BoletoOutcome onConfirmPayment={onConfirmPayment} />;
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <SuccessState amountCents={amountCents} cycle={cycle} email={email} onReset={onReset} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-8">
        <PaymentErrorBanner
          message={errorMessage ?? "Não foi possível confirmar seu pagamento."}
        />
        <Button type="button" variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return null;
}

const PROCESSING_STEPS = ["Verificando dados", "Conectando com seu banco", "Confirmando pagamento"];
const PROCESSING_STEP_MS = 620;

function ProcessingOutcome() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= PROCESSING_STEPS.length - 1) return;
    const timeout = setTimeout(() => {
      setActiveIndex((current) => Math.min(current + 1, PROCESSING_STEPS.length - 1));
    }, PROCESSING_STEP_MS);
    return () => clearTimeout(timeout);
  }, [activeIndex]);

  return (
    <div className="flex flex-col items-center gap-8 rounded-2xl border border-border bg-card p-10 text-center sm:p-14">
      <div className="relative flex size-16 items-center justify-center">
        <svg className="size-16 animate-spin" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" strokeWidth="4" className="stroke-border" />
          <circle
            cx="32"
            cy="32"
            r="28"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="44 132"
            className="stroke-primary"
          />
        </svg>
        <Lock className="absolute size-5 text-primary" />
      </div>

      <div className="flex w-full max-w-60 flex-col gap-4">
        <p className="font-heading text-base font-semibold text-foreground">
          Processando pagamento
        </p>
        <ul className="flex flex-col gap-2.5 text-left">
          {PROCESSING_STEPS.map((step, index) => {
            const isDone = index < activeIndex;
            const isActive = index === activeIndex;
            return (
              <li key={step} className="flex items-center gap-2.5 text-sm">
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full",
                    isDone ? "bg-primary" : isActive ? "bg-accent" : "bg-muted"
                  )}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isDone ? (
                      <motion.span
                        key="done"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={signatureTransition(0.25)}
                      >
                        <Check className="size-3 text-primary-foreground" />
                      </motion.span>
                    ) : isActive ? (
                      <motion.span
                        key="active"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={signatureTransition(0.2)}
                        className="size-1.5 animate-pulse rounded-full bg-primary"
                      />
                    ) : null}
                  </AnimatePresence>
                </span>
                <span className={cn(isDone || isActive ? "text-foreground" : "text-muted-foreground")}>
                  {step}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function PixOutcome({
  automatic,
  onConfirmPayment,
}: {
  automatic: boolean;
  onConfirmPayment: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const { copied, copy } = useCopyToClipboard();
  const isExpired = secondsLeft <= 0;

  useEffect(() => {
    if (isExpired) return;
    const interval = setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isExpired]);

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 text-center">
      <div>
        <PixIcon className="mx-auto size-8 text-primary" />
        <h2 className="mt-3 font-heading text-lg font-semibold text-foreground">
          {automatic ? "Autorize o débito automático" : "Pague com Pix"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {automatic
            ? "Escaneie o QR Code no app do seu banco para autorizar."
            : "Escaneie o QR Code ou copie o código abaixo."}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-white p-4">
        <QRCodeSVG value={PIX_PAYLOAD} size={160} bgColor="#ffffff" fgColor="#31333d" level="M" />
      </div>

      <div>
        <p className="text-sm text-muted-foreground">{isExpired ? "Código expirado" : "Expira em"}</p>
        {!isExpired && (
          <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">
            {minutes}:{seconds}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => copy(PIX_PAYLOAD)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-muted px-4 py-3 text-left"
      >
        <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">
          {PIX_PAYLOAD}
        </span>
        {copied ? (
          <Check className="size-4 shrink-0 text-primary" />
        ) : (
          <Copy className="size-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      <Button type="button" size="lg" className="h-12 w-full text-base" onClick={onConfirmPayment}>
        Já paguei
      </Button>
    </div>
  );
}

function BoletoOutcome({ onConfirmPayment }: { onConfirmPayment: () => void }) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-8">
      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground">Boleto gerado</h2>
        <p className="mt-1 text-sm text-muted-foreground">Vence em 3 dias úteis.</p>
      </div>

      <div className="rounded-xl border border-border bg-white p-5">
        <div
          className="h-16 w-full rounded"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #31333d 0px, #31333d 2px, transparent 2px, transparent 5px, #31333d 5px, #31333d 8px, transparent 8px, transparent 11px)",
          }}
        />
        <p className="mt-4 text-center font-mono text-sm tracking-wide text-foreground">
          {BOLETO_CODE}
        </p>
      </div>

      <button
        type="button"
        onClick={() => copy(BOLETO_CODE)}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-muted px-4 py-3 text-sm font-medium text-foreground"
      >
        {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
        {copied ? "Código copiado" : "Copiar código de barras"}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        A confirmação do pagamento pode levar até 2 dias úteis.
      </p>

      <Button type="button" size="lg" className="h-12 text-base" onClick={onConfirmPayment}>
        Já paguei o boleto
      </Button>
    </div>
  );
}
