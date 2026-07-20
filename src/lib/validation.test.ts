import { describe, expect, it } from "vitest";
import { cardFormSchema, pixAutomaticoConsentSchema } from "@/lib/validation";

function futureExpiry(): string {
  const now = new Date();
  const year = String((now.getFullYear() + 1) % 100).padStart(2, "0");
  return `01/${year}`;
}

describe("cardFormSchema", () => {
  it("accepts a fully valid card", () => {
    const result = cardFormSchema.safeParse({
      cardNumber: "4242424242424242",
      cardName: "Ada Lovelace",
      expiry: futureExpiry(),
      cvv: "123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a card number that fails the Luhn checksum", () => {
    const result = cardFormSchema.safeParse({
      cardNumber: "4242424242424241",
      cardName: "Ada Lovelace",
      expiry: futureExpiry(),
      cvv: "123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("cardNumber"))).toBe(true);
    }
  });

  it("rejects a CVV with the wrong length for the detected brand", () => {
    const result = cardFormSchema.safeParse({
      cardNumber: "378282246310005",
      cardName: "Ada Lovelace",
      expiry: futureExpiry(),
      cvv: "123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("cvv"))).toBe(true);
    }
  });

  it("rejects a name that is too short", () => {
    const result = cardFormSchema.safeParse({
      cardNumber: "4242424242424242",
      cardName: "Al",
      expiry: futureExpiry(),
      cvv: "123",
    });
    expect(result.success).toBe(false);
  });
});

describe("pixAutomaticoConsentSchema", () => {
  it("accepts consent given", () => {
    expect(pixAutomaticoConsentSchema.safeParse({ consent: true }).success).toBe(true);
  });

  it("rejects consent withheld", () => {
    expect(pixAutomaticoConsentSchema.safeParse({ consent: false }).success).toBe(false);
  });
});
