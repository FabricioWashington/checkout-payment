# Nebula Checkout

Checkout de assinatura interativo: cartão com preview 3D em tempo real, Pix (com e sem
recorrência automática), boleto e carteira digital, com validação de dados pessoais e
resumo de compra fixo.

> Projeto de demonstração: os pagamentos são simulados, sem integração com gateway real.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Framer Motion](https://motion.dev) para transições e micro-interações
- [GSAP](https://gsap.com) para animações imperativas (sheen do cartão)
- [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) para validação
- [Vitest](https://vitest.dev) para testes unitários

## Como executar

Pré-requisitos: Node.js 20+ e npm.

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Scripts disponíveis

| Comando         | Descrição                                   |
| --------------- | -------------------------------------------- |
| `npm run dev`   | Sobe o servidor de desenvolvimento           |
| `npm run build` | Gera o build de produção                     |
| `npm run start` | Serve o build de produção                    |
| `npm run lint`  | Roda o ESLint                                |
| `npm run test`  | Roda os testes unitários (Vitest)            |

## Estrutura

```
src/
  app/                 layout, página e estilos globais
  components/
    ui/                primitivos shadcn/ui
    checkout/          componentes do fluxo de checkout
      forms/           campos por método de pagamento e dados pessoais
      icons/           ícones que não existem no lucide-react
  hooks/               estado do checkout e hooks de apoio
  lib/                 lógica de domínio (cartão, dados pessoais, planos, validação)
```

## Métodos de pagamento

- **Cartão de crédito** — preview 3D ao vivo, com flip no CVV e detecção de bandeira
- **Pix** — QR code, copia e cola e contagem regressiva
- **Pix Automático** — autorização de débito recorrente
- **Boleto** — código de barras e copiar
- **Carteira digital** — Apple Pay / Google Pay (mock)
