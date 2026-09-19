import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Andora } from '@/constants/Andora';

// Pure helper: how many characters are visible after `tick` ticks.
export function typedLength(
  textLength: number,
  tick: number,
  charsPerTick: number
): number {
  return Math.min(textLength, Math.max(0, tick) * Math.max(1, charsPerTick));
}

// Animated typing dots shown while the demo mic "speaks".
export function TypingDots({ color }: { color?: string }) {
  const first = useRef(new Animated.Value(0.3)).current;
  const second = useRef(new Animated.Value(0.3)).current;
  const third = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 320,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.3,
            duration: 320,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    const loops = [pulse(first, 0), pulse(second, 180), pulse(third, 360)];
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [first, second, third]);

  return (
    <View style={styles.dotsRow} accessibilityLabel="Mengetik">
      {[first, second, third].map((value, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            { backgroundColor: color ?? Andora.colors.textMuted },
            { opacity: value },
          ]}
        />
      ))}
    </View>
  );
}

// Reveals text character-by-character, then calls onDone once.
export function TypingText({
  text,
  style,
  charsPerTick = 2,
  tickMs = 18,
  onDone,
}: {
  text: string;
  style?: object;
  charsPerTick?: number;
  tickMs?: number;
  onDone?: () => void;
}) {
  const [shown, setShown] = useState('');
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    setShown('');
    doneRef.current = false;
    if (!text) {
      onDoneRef.current?.();
      return;
    }
    let tick = 0;
    const timer = setInterval(() => {
      tick += 1;
      const count = typedLength(text.length, tick, charsPerTick);
      if (count >= text.length) {
        clearInterval(timer);
        setShown(text);
        if (!doneRef.current) {
          doneRef.current = true;
          onDoneRef.current?.();
        }
        return;
      }
      setShown(text.slice(0, count));
    }, tickMs);
    return () => clearInterval(timer);
  }, [text, charsPerTick, tickMs]);

  return <Text style={style}>{shown}</Text>;
}

const styles = StyleSheet.create({
  dotsRow: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
});
