"use client";

import { useRef } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { CreditCard, Wifi } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { detectCardBrand, getCardNumberDisplayGroups } from "@/lib/card";
import type { CardPreviewState } from "@/hooks/use-card-preview";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { signatureTransition } from "@/lib/motion";

interface CreditCard3DProps {
  preview: CardPreviewState;
}

export function CreditCard3D({ preview }: CreditCard3DProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 150, damping: 20, mass: 0.6 });
  const springY = useSpring(rotateY, { stiffness: 150, damping: 20, mass: 0.6 });

  const brand = detectCardBrand(preview.number);
  const isFlipped = preview.focusedField === "cvv";
  const numberGroups = getCardNumberDisplayGroups(preview.number, brand);
  const displayName = preview.name.trim().length > 0 ? preview.name.toUpperCase() : "SEU NOME AQUI";
  const displayExpiry = preview.expiry.length > 0 ? preview.expiry : "MM/AA";
  const displayCvv = preview.cvv.padEnd(brand.cvvLength, "•");

  useGSAP(
    () => {
      if (prefersReducedMotion || !sheenRef.current) return;
      gsap.fromTo(
        sheenRef.current,
        { xPercent: -160 },
        {
          xPercent: 160,
          duration: 5,
          ease: "power1.inOut",
          repeat: -1,
          repeatDelay: 1.8,
        }
      );
    },
    { scope: wrapperRef, dependencies: [prefersReducedMotion] }
  );

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 14);
    rotateX.set(py * -14);
  }

  function handlePointerLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div
      ref={wrapperRef}
      className="w-full [perspective:1600px]"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <motion.div
        style={{ rotateX: springX, rotateY: springY }}
        className="relative aspect-[1.586/1] w-full [transform-style:preserve-3d]"
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={signatureTransition(0.6)}
          className="absolute inset-0 [transform-style:preserve-3d]"
        >
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl p-5 shadow-xl shadow-brand-navy/20 backface-hidden sm:p-6"
            style={{
              background:
                "radial-gradient(120% 120% at 78% 12%, rgba(255,255,255,0.14) 0%, transparent 55%), linear-gradient(135deg, var(--color-brand-navy) 0%, #17296f 55%, #2f4599 100%)",
            }}
          >
            <div
              ref={sheenRef}
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/25 to-transparent"
            />
            <div className="relative flex h-full flex-col justify-between text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative h-7 w-9 overflow-hidden rounded-[5px] bg-linear-to-br from-[#f7e6b4] via-[#dbb977] to-[#a8793e] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)]">
                    <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/15" />
                    <div className="absolute inset-y-0 left-1/3 w-px bg-black/15" />
                    <div className="absolute inset-y-0 right-1/3 w-px bg-black/15" />
                  </div>
                  <Wifi className="size-4 rotate-90 text-white/70" />
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={brand.id}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={signatureTransition(0.25)}
                  >
                    {brand.id === "unknown" ? (
                      <CreditCard className="size-6 text-white/50" />
                    ) : (
                      <span className="font-heading text-base font-bold tracking-tight italic">
                        {brand.label}
                      </span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div>
                <div className="flex gap-3 font-mono text-lg tracking-[0.15em] sm:text-xl">
                  {numberGroups.map((group, index) => (
                    <span key={index} className="tabular-nums">
                      {group}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div className="flex max-w-[65%] flex-col gap-0.5">
                    <span className="text-[9px] font-medium tracking-[0.15em] text-white/45">
                      TITULAR
                    </span>
                    <span className="truncate text-sm tracking-wide text-white/90">
                      {displayName}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[9px] font-medium tracking-[0.15em] text-white/45">
                      VALIDADE
                    </span>
                    <span className="font-mono text-sm text-white/90">{displayExpiry}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute inset-0 overflow-hidden rounded-2xl backface-hidden transform-[rotateY(180deg)]"
            style={{
              background:
                "radial-gradient(120% 120% at 78% 12%, rgba(255,255,255,0.14) 0%, transparent 55%), linear-gradient(135deg, var(--color-brand-navy) 0%, #17296f 55%, #2f4599 100%)",
            }}
          >
            <div className="mt-6 h-11 w-full bg-black/60" />
            <div className="mt-6 flex items-center justify-end px-6">
              <div className="flex h-9 w-4/5 items-center justify-end rounded bg-white/85 px-3">
                <span className="font-mono text-sm tracking-[0.3em] text-black/70">
                  {displayCvv}
                </span>
              </div>
            </div>
            <p className="mt-3 px-6 text-[10px] tracking-wide text-white/60">
              Código de segurança
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
