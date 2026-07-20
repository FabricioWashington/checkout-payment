"use client";

import { useCallback, useReducer } from "react";
import type { BillingCycle } from "@/lib/plans";

export type CheckoutStep = "form" | "outcome";
export type PaymentMethodId =
  | "card"
  | "pix"
  | "pix_automatico"
  | "boleto"
  | "apple_pay"
  | "google_pay";
export type PaymentStatus =
  | "idle"
  | "processing"
  | "awaiting_pix"
  | "awaiting_boleto"
  | "success"
  | "error";

interface CheckoutState {
  step: CheckoutStep;
  cycle: BillingCycle;
  method: PaymentMethodId;
  status: PaymentStatus;
  errorMessage: string | null;
}

type CheckoutAction =
  | { type: "SET_CYCLE"; cycle: BillingCycle }
  | { type: "SET_METHOD"; method: PaymentMethodId }
  | { type: "SUBMIT_START" }
  | { type: "AWAIT_PIX" }
  | { type: "AWAIT_BOLETO" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "SUBMIT_ERROR"; message: string }
  | { type: "BACK_TO_FORM" }
  | { type: "RESET" };

const initialState: CheckoutState = {
  step: "form",
  cycle: "monthly",
  method: "card",
  status: "idle",
  errorMessage: null,
};

function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case "SET_CYCLE":
      return { ...state, cycle: action.cycle };
    case "SET_METHOD":
      return { ...state, method: action.method, status: "idle", errorMessage: null };
    case "SUBMIT_START":
      return { ...state, step: "outcome", status: "processing", errorMessage: null };
    case "AWAIT_PIX":
      return { ...state, status: "awaiting_pix" };
    case "AWAIT_BOLETO":
      return { ...state, status: "awaiting_boleto" };
    case "SUBMIT_SUCCESS":
      return { ...state, status: "success" };
    case "SUBMIT_ERROR":
      return { ...state, status: "error", errorMessage: action.message };
    case "BACK_TO_FORM":
      return { ...state, step: "form", status: "idle", errorMessage: null };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export function useCheckout() {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  const setCycle = useCallback((cycle: BillingCycle) => dispatch({ type: "SET_CYCLE", cycle }), []);
  const setMethod = useCallback(
    (method: PaymentMethodId) => dispatch({ type: "SET_METHOD", method }),
    []
  );
  const submitStart = useCallback(() => dispatch({ type: "SUBMIT_START" }), []);
  const awaitPix = useCallback(() => dispatch({ type: "AWAIT_PIX" }), []);
  const awaitBoleto = useCallback(() => dispatch({ type: "AWAIT_BOLETO" }), []);
  const submitSuccess = useCallback(() => dispatch({ type: "SUBMIT_SUCCESS" }), []);
  const submitError = useCallback(
    (message: string) => dispatch({ type: "SUBMIT_ERROR", message }),
    []
  );
  const backToForm = useCallback(() => dispatch({ type: "BACK_TO_FORM" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return {
    state,
    actions: {
      setCycle,
      setMethod,
      submitStart,
      awaitPix,
      awaitBoleto,
      submitSuccess,
      submitError,
      backToForm,
      reset,
    },
  };
}
