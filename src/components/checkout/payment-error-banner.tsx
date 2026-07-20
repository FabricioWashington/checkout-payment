"use client";

import { AlertCircle } from "lucide-react";

interface PaymentErrorBannerProps {
  message: string;
}

export function PaymentErrorBanner({ message }: PaymentErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
