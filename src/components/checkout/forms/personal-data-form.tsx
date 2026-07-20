"use client";

import { Controller, type Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { formatCpf, formatPhone } from "@/lib/personal-data";
import type { PersonalDataValues } from "@/lib/validation";

interface PersonalDataFormProps {
  control: Control<PersonalDataValues>;
  disabled?: boolean;
}

export function PersonalDataForm({ control, disabled }: PersonalDataFormProps) {
  return (
    <FieldGroup>
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              disabled={disabled}
              {...field}
            />
            <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
          </Field>
        )}
      />

      <Controller
        control={control}
        name="fullName"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="fullName">Nome completo</FieldLabel>
            <Input
              id="fullName"
              autoComplete="name"
              placeholder="Ana Cristina da Silva"
              disabled={disabled}
              {...field}
            />
            <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
          </Field>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          control={control}
          name="document"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="document">CPF</FieldLabel>
              <Input
                id="document"
                inputMode="numeric"
                placeholder="000.000.000-00"
                disabled={disabled}
                maxLength={14}
                value={formatCpf(field.value)}
                onChange={(event) => field.onChange(formatCpf(event.target.value))}
                onBlur={field.onBlur}
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="phone">Celular com DDD</FieldLabel>
              <Input
                id="phone"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(00) 00000-0000"
                disabled={disabled}
                maxLength={15}
                value={formatPhone(field.value)}
                onChange={(event) => field.onChange(formatPhone(event.target.value))}
                onBlur={field.onBlur}
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
            </Field>
          )}
        />
      </div>
    </FieldGroup>
  );
}
