export const EASE_SIGNATURE = [0.22, 1, 0.36, 1] as const;

export function signatureTransition(duration = 0.4, delay = 0) {
  return { duration, delay, ease: EASE_SIGNATURE };
}

export const stepVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

export const fadeUpVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};
