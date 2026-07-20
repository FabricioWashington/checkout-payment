import { z } from "zod";
import { detectCardBrand, isExpiryDateValid, isValidLuhn, onlyDigits } from "@/lib/card";
import { isValidCpf, isValidPhone } from "@/lib/personal-data";

export const cardFormSchema = z
  .object({
    cardNumber: z.string().refine((value) => isValidLuhn(value), {
      message: "Número de cartão inválido",
    }),
    cardName: z
      .string()
      .trim()
      .min(3, "Informe o nome como está no cartão")
      .max(64, "Nome muito longo"),
    expiry: z.string().refine((value) => isExpiryDateValid(value), {
      message: "Validade inválida ou expirada",
    }),
    cvv: z.string().min(3, "CVV inválido").max(4, "CVV inválido"),
  })
  .superRefine((data, ctx) => {
    const brand = detectCardBrand(data.cardNumber);
    if (onlyDigits(data.cvv).length !== brand.cvvLength) {
      ctx.addIssue({
        code: "custom",
        path: ["cvv"],
        message: `CVV deve ter ${brand.cvvLength} dígitos para ${brand.label}`,
      });
    }
  });

export type CardFormValues = z.infer<typeof cardFormSchema>;

export const personalDataSchema = z.object({
  email: z.string().trim().min(1, "Informe seu e-mail").email("E-mail inválido"),
  fullName: z
    .string()
    .trim()
    .min(3, "Informe seu nome completo")
    .refine((value) => value.trim().split(/\s+/).length >= 2, {
      message: "Informe nome e sobrenome",
    }),
  document: z.string().refine((value) => isValidCpf(value), { message: "CPF inválido" }),
  phone: z.string().refine((value) => isValidPhone(value), { message: "Telefone inválido" }),
});

export type PersonalDataValues = z.infer<typeof personalDataSchema>;
