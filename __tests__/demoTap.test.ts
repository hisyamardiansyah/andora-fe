// Unit tests for the hidden demo entry tap counter.
import {
  DEMO_TAP_REQUIRED,
  DEMO_TAP_WINDOW_MS,
  demoTapReached,
  recordDemoTap,
} from '../lib/demoTap';

describe('demo tap entry', () => {
  it('reaches after five quick taps', () => {
    let taps: number[] = [];
    for (let i = 0; i < DEMO_TAP_REQUIRED; i += 1) {
      taps = recordDemoTap(taps, 1000 + i * 200);
    }
    expect(demoTapReached(taps)).toBe(true);
  });

  it('drops stale taps outside the window', () => {
    let taps = recordDemoTap([], 0);
    taps = recordDemoTap(taps, DEMO_TAP_WINDOW_MS + 1000);
    expect(taps).toHaveLength(1);
    expect(demoTapReached(taps)).toBe(false);
  });
});
