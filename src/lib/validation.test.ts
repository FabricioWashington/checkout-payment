import { describe, expect, it } from "vitest";
import { cardFormSchema, personalDataSchema } from "@/lib/validation";

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

describe("personalDataSchema", () => {
  const validPayload = {
    email: "ada@example.com",
    fullName: "Ada Lovelace",
    document: "529.982.247-25",
    phone: "(11) 98765-4321",
  };

  it("accepts a fully valid payload", () => {
    expect(personalDataSchema.safeParse(validPayload).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = personalDataSchema.safeParse({ ...validPayload, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a name without a surname", () => {
    const result = personalDataSchema.safeParse({ ...validPayload, fullName: "Ada" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid CPF", () => {
    const result = personalDataSchema.safeParse({ ...validPayload, document: "111.111.111-11" });
    expect(result.success).toBe(false);
  });

  it("rejects a phone with the wrong length", () => {
    const result = personalDataSchema.safeParse({ ...validPayload, phone: "(11) 9876-543" });
    expect(result.success).toBe(false);
  });
});
