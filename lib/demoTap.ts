// Hidden demo entry: tap the brand name 5 times within a short window.
// Pure helpers so the counting logic is unit-testable.
export const DEMO_TAP_REQUIRED = 5;
export const DEMO_TAP_WINDOW_MS = 3000;

export function recordDemoTap(
  taps: number[],
  now: number,
  windowMs: number = DEMO_TAP_WINDOW_MS
): number[] {
  return [...taps, now].filter((t) => now - t <= windowMs);
}

export function demoTapReached(
  taps: number[],
  required: number = DEMO_TAP_REQUIRED
): boolean {
  return taps.length >= required;
}
