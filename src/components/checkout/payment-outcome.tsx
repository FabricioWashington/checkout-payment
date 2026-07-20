"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PixIcon } from "@/components/checkout/icons/pix-icon";
import { SuccessState } from "@/components/checkout/success-state";
import { PaymentErrorBanner } from "@/components/checkout/payment-error-banner";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { PaymentMethodId, PaymentStatus } from "@/hooks/use-checkout";

const PIX_PAYLOAD =
  "00020126580014BR.GOV.BCB.PIX0136a629534e-7693-4846-b028-f142082d7b70520400005303986540510.005802BR5913Nebula Assinaturas6008Sao Paulo62070503***6304E2CA";
const BOLETO_CODE = "34191.79001 01043.510047 91020.150008 8 96780026000";
const COUNTDOWN_SECONDS = 15 * 60;

interface PaymentOutcomeProps {
  status: PaymentStatus;
  method: PaymentMethodId;
  amountCents: number;
  errorMessage: string | null;
  onConfirmPayment: () => void;
  onRetry: () => void;
  onReset: () => void;
}

export function PaymentOutcome({
  status,
  method,
  amountCents,
  errorMessage,
  onConfirmPayment,
  onRetry,
  onReset,
}: PaymentOutcomeProps) {
  if (status === "processing") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-16 text-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Processando pagamento...</p>
      </div>
    );
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
        <SuccessState amountCents={amountCents} onReset={onReset} />
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
        <span className="truncate font-mono text-xs text-muted-foreground">{PIX_PAYLOAD}</span>
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
