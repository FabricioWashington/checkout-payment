"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PixIcon } from "@/components/checkout/icons/pix-icon";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

const PIX_PAYLOAD =
  "00020126580014BR.GOV.BCB.PIX0136a629534e-7693-4846-b028-f142082d7b70520400005303986540510.005802BR5913Nebula Assinaturas6008Sao Paulo62070503***6304E2CA";
const COUNTDOWN_SECONDS = 15 * 60;

export function PixView() {
  const [generated, setGenerated] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const { copied, copy } = useCopyToClipboard();
  const isExpired = generated && secondsLeft <= 0;

  useEffect(() => {
    if (!generated || isExpired) return;
    const interval = setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [generated, isExpired]);

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  if (!generated) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-muted p-10 text-center">
        <PixIcon className="size-8 text-primary" />
        <p className="max-w-xs text-sm text-muted-foreground">
          Gere o QR Code para pagar com Pix. Ele fica válido por 15 minutos.
        </p>
        <Button type="button" onClick={() => setGenerated(true)}>
          Gerar QR Code
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 rounded-xl border border-border bg-muted p-6 text-center">
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

      {isExpired ? (
        <Button variant="outline" onClick={() => setSecondsLeft(COUNTDOWN_SECONDS)}>
          Gerar novo código
        </Button>
      ) : (
        <button
          type="button"
          onClick={() => copy(PIX_PAYLOAD)}
          className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left"
        >
          <span className="truncate font-mono text-xs text-muted-foreground">{PIX_PAYLOAD}</span>
          {copied ? (
            <Check className="size-4 shrink-0 text-primary" />
          ) : (
            <Copy className="size-4 shrink-0 text-muted-foreground" />
          )}
        </button>
      )}
    </div>
  );
}
