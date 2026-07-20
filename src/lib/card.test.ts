import { describe, expect, it } from "vitest";
import {
  detectCardBrand,
  formatCardNumber,
  formatCvv,
  formatExpiry,
  getCardNumberDisplayGroups,
  getCardNumberMaxLength,
  groupCardNumber,
  isExpiryDateValid,
  isValidLuhn,
  onlyDigits,
} from "@/lib/card";

describe("onlyDigits", () => {
  it("strips every non-digit character", () => {
    expect(onlyDigits("4242 4242-4242.4242")).toBe("4242424242424242");
  });
});

describe("detectCardBrand", () => {
  it("detects Visa by leading 4", () => {
    expect(detectCardBrand("4242424242424242").id).toBe("visa");
  });

  it("detects Mastercard by 51-55 range", () => {
    expect(detectCardBrand("5555555555554444").id).toBe("mastercard");
  });

  it("detects American Express by 34/37 prefix", () => {
    expect(detectCardBrand("378282246310005").id).toBe("amex");
  });

  it("detects Elo before falling back to Visa/Mastercard ranges", () => {
    expect(detectCardBrand("4011780000000000").id).toBe("elo");
  });

  it("falls back to unknown for unrecognized prefixes", () => {
    expect(detectCardBrand("0000000000000000").id).toBe("unknown");
  });
});

describe("isValidLuhn", () => {
  it("accepts a known-valid test card number", () => {
    expect(isValidLuhn("4242424242424242")).toBe(true);
  });

  it("rejects a number with a tampered check digit", () => {
    expect(isValidLuhn("4242424242424241")).toBe(false);
  });

  it("rejects numbers that are too short", () => {
    expect(isValidLuhn("4242")).toBe(false);
  });
});

describe("groupCardNumber / formatCardNumber", () => {
  it("groups a Visa number into 4-4-4-4", () => {
    const brand = detectCardBrand("4242424242424242");
    expect(groupCardNumber("4242424242424242", brand)).toEqual(["4242", "4242", "4242", "4242"]);
    expect(formatCardNumber("4242424242424242", brand)).toBe("4242 4242 4242 4242");
  });

  it("groups an Amex number into 4-6-5", () => {
    const brand = detectCardBrand("378282246310005");
    expect(formatCardNumber("378282246310005", brand)).toBe("3782 822463 10005");
  });

  it("truncates digits beyond the brand max length", () => {
    const brand = detectCardBrand("4242424242424242");
    expect(formatCardNumber("42424242424242429999", brand)).toBe("4242 4242 4242 4242");
  });
});

describe("getCardNumberDisplayGroups", () => {
  it("pads incomplete groups with bullet placeholders", () => {
    const brand = detectCardBrand("4242");
    expect(getCardNumberDisplayGroups("4242", brand)).toEqual(["4242", "••••", "••••", "••••"]);
  });
});

describe("getCardNumberMaxLength", () => {
  it("sums the group sizes for the brand", () => {
    expect(getCardNumberMaxLength(detectCardBrand("4242"))).toBe(16);
    expect(getCardNumberMaxLength(detectCardBrand("378282246310005"))).toBe(15);
  });
});

describe("formatExpiry", () => {
  it("inserts the slash once the month is complete", () => {
    expect(formatExpiry("1")).toBe("1");
    expect(formatExpiry("12")).toBe("12");
    expect(formatExpiry("123")).toBe("12/3");
    expect(formatExpiry("1225")).toBe("12/25");
  });

  it("ignores non-digit characters and caps at 4 digits", () => {
    expect(formatExpiry("12/25/99")).toBe("12/25");
  });
});

describe("isExpiryDateValid", () => {
  const now = new Date();
  const futureYear = (now.getFullYear() + 1) % 100;
  const pastYear = (now.getFullYear() - 1) % 100;

  it("accepts a date in the future", () => {
    expect(isExpiryDateValid(`01/${String(futureYear).padStart(2, "0")}`)).toBe(true);
  });

  it("rejects a date in the past", () => {
    expect(isExpiryDateValid(`01/${String(pastYear).padStart(2, "0")}`)).toBe(false);
  });

  it("rejects an invalid month", () => {
    const nextYear = String((now.getFullYear() + 1) % 100).padStart(2, "0");
    expect(isExpiryDateValid(`13/${nextYear}`)).toBe(false);
  });

  it("rejects incomplete input", () => {
    expect(isExpiryDateValid("12/2")).toBe(false);
  });
});

describe("formatCvv", () => {
  it("caps at 3 digits for Visa", () => {
    const brand = detectCardBrand("4242");
    expect(formatCvv("12345", brand)).toBe("123");
  });

  it("caps at 4 digits for Amex", () => {
    const brand = detectCardBrand("378282246310005");
    expect(formatCvv("12345", brand)).toBe("1234");
  });
});
