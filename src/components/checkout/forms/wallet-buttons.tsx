import { Apple, Wallet } from "lucide-react";

export function WalletButtons() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted p-6">
      <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-medium text-foreground shadow-sm">
        <Apple className="size-5" fill="currentColor" />
        Apple Pay
      </div>
      <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-medium text-foreground shadow-sm">
        <Wallet className="size-5" />
        Google Pay
      </div>
      <p className="text-center text-xs text-muted-foreground">
        A opção disponível depende do dispositivo usado no momento do pagamento.
      </p>
    </div>
  );
}
