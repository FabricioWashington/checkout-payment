import { onlyDigits } from "@/lib/card";

export function formatCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 9);
  const part4 = digits.slice(9, 11);

  let formatted = part1;
  if (part2) formatted += `.${part2}`;
  if (part3) formatted += `.${part3}`;
  if (part4) formatted += `-${part4}`;
  return formatted;
}

export function formatPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  const ddd = digits.slice(0, 2);
  const prefix = digits.slice(2, 7);
  const suffix = digits.slice(7, 11);

  if (digits.length <= 2) return ddd;
  let formatted = `(${ddd}) ${prefix}`;
  if (suffix) formatted += `-${suffix}`;
  return formatted;
}

export function isValidCpf(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const calculateCheckDigit = (base: string, weightStart: number): number => {
    const sum = base
      .split("")
      .reduce((total, digit, index) => total + Number(digit) * (weightStart - index), 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstCheckDigit = calculateCheckDigit(digits.slice(0, 9), 10);
  const secondCheckDigit = calculateCheckDigit(digits.slice(0, 10), 11);

  return firstCheckDigit === Number(digits[9]) && secondCheckDigit === Number(digits[10]);
}

export function isValidPhone(value: string): boolean {
  return onlyDigits(value).length === 11;
}
