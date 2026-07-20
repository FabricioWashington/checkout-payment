export type CardBrandId =
  | "visa"
  | "mastercard"
  | "amex"
  | "elo"
  | "hipercard"
  | "diners"
  | "discover"
  | "unknown";

export interface CardBrand {
  id: CardBrandId;
  label: string;
  pattern: RegExp;
  groupSizes: number[];
  cvvLength: number;
}

const UNKNOWN_BRAND: CardBrand = {
  id: "unknown",
  label: "Cartão",
  pattern: /^$/,
  groupSizes: [4, 4, 4, 4],
  cvvLength: 3,
};

const CARD_BRANDS: CardBrand[] = [
  {
    id: "amex",
    label: "American Express",
    pattern: /^3[47]/,
    groupSizes: [4, 6, 5],
    cvvLength: 4,
  },
  {
    id: "diners",
    label: "Diners Club",
    pattern: /^3(?:0[0-5]|[68]\d)/,
    groupSizes: [4, 6, 4],
    cvvLength: 3,
  },
  {
    id: "hipercard",
    label: "Hipercard",
    pattern: /^(?:606282|3841)/,
    groupSizes: [4, 4, 4, 4],
    cvvLength: 3,
  },
  {
    id: "elo",
    label: "Elo",
    pattern:
      /^(?:4011|4312|4389|4514|4573|5041|5066|5067|5090|6277|6362|6363|6500|6504|6505|6507|6509|6516|6550)/,
    groupSizes: [4, 4, 4, 4],
    cvvLength: 3,
  },
  {
    id: "discover",
    label: "Discover",
    pattern: /^(?:6011|65)/,
    groupSizes: [4, 4, 4, 4],
    cvvLength: 3,
  },
  {
    id: "mastercard",
    label: "Mastercard",
    pattern: /^(?:5[1-5]|2(?:2[2-9]|[3-6]\d|7[01]|720))/,
    groupSizes: [4, 4, 4, 4],
    cvvLength: 3,
  },
  {
    id: "visa",
    label: "Visa",
    pattern: /^4/,
    groupSizes: [4, 4, 4, 4],
    cvvLength: 3,
  },
];

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = onlyDigits(cardNumber);
  return CARD_BRANDS.find((brand) => brand.pattern.test(digits)) ?? UNKNOWN_BRAND;
}

export function getCardNumberMaxLength(brand: CardBrand): number {
  return brand.groupSizes.reduce((total, size) => total + size, 0);
}

export function groupCardNumber(cardNumber: string, brand: CardBrand): string[] {
  const digits = onlyDigits(cardNumber).slice(0, getCardNumberMaxLength(brand));
  const groups: string[] = [];
  let cursor = 0;
  for (const size of brand.groupSizes) {
    groups.push(digits.slice(cursor, cursor + size));
    cursor += size;
  }
  return groups.filter((group) => group.length > 0);
}

export function formatCardNumber(cardNumber: string, brand: CardBrand): string {
  return groupCardNumber(cardNumber, brand).join(" ");
}

export function getCardNumberDisplayGroups(cardNumber: string, brand: CardBrand): string[] {
  const digits = onlyDigits(cardNumber).slice(0, getCardNumberMaxLength(brand));
  const groups: string[] = [];
  let cursor = 0;
  for (const size of brand.groupSizes) {
    const groupDigits = digits.slice(cursor, cursor + size);
    groups.push(groupDigits.padEnd(size, "•"));
    cursor += size;
  }
  return groups;
}

export function formatExpiry(expiry: string): string {
  let digits = onlyDigits(expiry).slice(0, 4);

  if (digits.length === 1 && Number(digits) > 1) {
    digits = `0${digits}`;
  }

  if (digits.length >= 2) {
    const month = Number(digits.slice(0, 2));
    if (month > 12) {
      digits = `12${digits.slice(2)}`;
    } else if (month === 0) {
      digits = `01${digits.slice(2)}`;
    }
  }

  digits = digits.slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function formatCvv(cvv: string, brand: CardBrand): string {
  return onlyDigits(cvv).slice(0, brand.cvvLength);
}

export function isExpiryDateValid(expiry: string): boolean {
  const digits = onlyDigits(expiry);
  if (digits.length !== 4) return false;
  const month = Number(digits.slice(0, 2));
  const year = Number(`20${digits.slice(2)}`);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
}

export function isValidLuhn(cardNumber: string): boolean {
  const digits = onlyDigits(cardNumber);
  if (digits.length < 12) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}
