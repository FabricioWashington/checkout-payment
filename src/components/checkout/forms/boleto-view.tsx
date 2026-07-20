"use client";

import { useState } from "react";
import { Barcode, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

const BOLETO_CODE = "34191.79001 01043.510047 91020.150008 8 96780026000";

export function BoletoView() {
  const [generated, setGenerated] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  if (!generated) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-muted p-10 text-center">
        <Barcode className="size-8 text-primary" />
        <p className="max-w-xs text-sm text-muted-foreground">
          Gere o boleto para pagar em qualquer banco ou lotérica. Vence em 3 dias úteis.
        </p>
        <Button type="button" onClick={() => setGenerated(true)}>
          Gerar boleto
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted p-6">
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
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground"
      >
        {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
        {copied ? "Código copiado" : "Copiar código de barras"}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Vence em 3 dias úteis. A confirmação do pagamento pode levar até 2 dias úteis.
      </p>
    </div>
  );
}
