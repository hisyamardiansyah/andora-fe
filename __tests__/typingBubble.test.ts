// Unit tests for the shipped typing helper (pure function).
import { typedLength } from '../components/TypingBubble';

describe('typedLength', () => {
  it('reveals characters tick by tick and clamps at full length', () => {
    expect(typedLength(10, 0, 2)).toBe(0);
    expect(typedLength(10, 1, 2)).toBe(2);
    expect(typedLength(10, 3, 2)).toBe(6);
    expect(typedLength(10, 99, 2)).toBe(10);
  });

  it('handles empty text and odd rates', () => {
    expect(typedLength(0, 5, 2)).toBe(0);
    expect(typedLength(7, 2, 3)).toBe(6);
    expect(typedLength(7, -1, 2)).toBe(0);
  });
});
