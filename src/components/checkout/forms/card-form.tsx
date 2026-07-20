"use client";

import { Controller, useWatch, type Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { CardFormValues } from "@/lib/validation";
import {
  detectCardBrand,
  formatCardNumber,
  formatCvv,
  formatExpiry,
  getCardNumberMaxLength,
} from "@/lib/card";
import type { CardPreviewState } from "@/hooks/use-card-preview";

interface CardFormProps {
  control: Control<CardFormValues>;
  onUpdatePreview: (patch: Partial<CardPreviewState>) => void;
  disabled?: boolean;
}

export function CardForm({ control, onUpdatePreview, disabled }: CardFormProps) {
  const cardNumberValue = useWatch({ control, name: "cardNumber" });
  const brand = detectCardBrand(cardNumberValue);

  return (
    <FieldGroup>
      <Controller
        control={control}
        name="cardNumber"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="cardNumber">Número do cartão</FieldLabel>
            <Input
              id="cardNumber"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="0000 0000 0000 0000"
              disabled={disabled}
              value={formatCardNumber(field.value, brand)}
              maxLength={getCardNumberMaxLength(brand) + brand.groupSizes.length}
              onChange={(event) => {
                const formatted = formatCardNumber(event.target.value, brand);
                field.onChange(formatted);
                onUpdatePreview({ number: formatted });
              }}
              onFocus={() => onUpdatePreview({ focusedField: "number" })}
              onBlur={() => {
                field.onBlur();
                onUpdatePreview({ focusedField: null });
              }}
            />
            <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
          </Field>
        )}
      />

      <Controller
        control={control}
        name="cardName"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="cardName">Nome no cartão</FieldLabel>
            <Input
              id="cardName"
              autoComplete="cc-name"
              placeholder="Como está no cartão"
              disabled={disabled}
              name={field.name}
              ref={field.ref}
              value={field.value}
              onChange={(event) => {
                field.onChange(event);
                onUpdatePreview({ name: event.target.value });
              }}
              onFocus={() => onUpdatePreview({ focusedField: "name" })}
              onBlur={() => {
                field.onBlur();
                onUpdatePreview({ focusedField: null });
              }}
            />
            <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
          </Field>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          control={control}
          name="expiry"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="expiry">Validade</FieldLabel>
              <Input
                id="expiry"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/AA"
                disabled={disabled}
                maxLength={5}
                value={formatExpiry(field.value)}
                onChange={(event) => {
                  const formatted = formatExpiry(event.target.value);
                  field.onChange(formatted);
                  onUpdatePreview({ expiry: formatted });
                }}
                onFocus={() => onUpdatePreview({ focusedField: "expiry" })}
                onBlur={() => {
                  field.onBlur();
                  onUpdatePreview({ focusedField: null });
                }}
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="cvv"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="cvv">CVV</FieldLabel>
              <Input
                id="cvv"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder={brand.cvvLength === 4 ? "0000" : "000"}
                disabled={disabled}
                maxLength={brand.cvvLength}
                value={formatCvv(field.value, brand)}
                onChange={(event) => {
                  const formatted = formatCvv(event.target.value, brand);
                  field.onChange(formatted);
                  onUpdatePreview({ cvv: formatted });
                }}
                onFocus={() => onUpdatePreview({ focusedField: "cvv" })}
                onBlur={() => {
                  field.onBlur();
                  onUpdatePreview({ focusedField: null });
                }}
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
            </Field>
          )}
        />
      </div>
    </FieldGroup>
  );
}
