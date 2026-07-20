"use client";

import { useCallback, useState } from "react";

export type CardFieldName = "number" | "name" | "expiry" | "cvv";

export interface CardPreviewState {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  focusedField: CardFieldName | null;
}

const initialPreview: CardPreviewState = {
  number: "",
  name: "",
  expiry: "",
  cvv: "",
  focusedField: null,
};

export function useCardPreview() {
  const [preview, setPreview] = useState<CardPreviewState>(initialPreview);

  const updatePreview = useCallback((patch: Partial<CardPreviewState>) => {
    setPreview((prev) => ({ ...prev, ...patch }));
  }, []);

  return { preview, updatePreview };
}
