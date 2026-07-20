export type BillingCycle = "monthly" | "annual";

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthlyPriceCents: number;
  annualPriceCents: number;
  features: string[];
}

export const PRO_PLAN: Plan = {
  id: "pro",
  name: "Pro",
  tagline: "Para times que não podem parar",
  monthlyPriceCents: 4990,
  annualPriceCents: 47900,
  features: [
    "Projetos ilimitados",
    "Suporte prioritário 24/7",
    "Exportação avançada de dados",
    "Acesso antecipado a novidades",
  ],
};

export function getAnnualMonthlyEquivalentCents(plan: Plan): number {
  return Math.round(plan.annualPriceCents / 12);
}

export function getAnnualSavingsPercent(plan: Plan): number {
  const fullYearAtMonthlyRate = plan.monthlyPriceCents * 12;
  const savings = fullYearAtMonthlyRate - plan.annualPriceCents;
  return Math.round((savings / fullYearAtMonthlyRate) * 100);
}

export function getPriceForCycle(plan: Plan, cycle: BillingCycle): number {
  return cycle === "monthly" ? plan.monthlyPriceCents : plan.annualPriceCents;
}

export function formatCentsToBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
