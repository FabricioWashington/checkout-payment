"use client";

import { useCallback, useReducer } from "react";
import type { BillingCycle } from "@/lib/plans";

export type CheckoutStep = "checkout" | "success";
export type PaymentMethodId = "card" | "pix" | "pix_automatico" | "boleto" | "wallet";
export type PaymentStatus = "idle" | "processing" | "success" | "error";

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
  | { type: "SUBMIT_SUCCESS" }
  | { type: "SUBMIT_ERROR"; message: string }
  | { type: "RESET_STATUS" }
  | { type: "RESET" };

const initialState: CheckoutState = {
  step: "checkout",
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
      return { ...state, status: "processing", errorMessage: null };
    case "SUBMIT_SUCCESS":
      return { ...state, status: "success", step: "success" };
    case "SUBMIT_ERROR":
      return { ...state, status: "error", errorMessage: action.message };
    case "RESET_STATUS":
      return { ...state, status: "idle", errorMessage: null };
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
  const submitSuccess = useCallback(() => dispatch({ type: "SUBMIT_SUCCESS" }), []);
  const submitError = useCallback(
    (message: string) => dispatch({ type: "SUBMIT_ERROR", message }),
    []
  );
  const resetStatus = useCallback(() => dispatch({ type: "RESET_STATUS" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return {
    state,
    actions: {
      setCycle,
      setMethod,
      submitStart,
      submitSuccess,
      submitError,
      resetStatus,
      reset,
    },
  };
}
