import React from 'react';
import renderer, { act } from 'react-test-renderer';
import AssistantOrb from '../components/AssistantOrb';

jest.mock('@livekit/react-native', () => ({
  useTrackVolume: () => 0.5,
}));

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  const identity = (value: unknown) => value;
  const passthrough = (fn: () => unknown) => fn();
  const easeFn = (x: number) => x;
  return {
    __esModule: true,
    default: { View },
    Easing: {
      linear: easeFn,
      ease: easeFn,
      inOut: () => easeFn,
      out: () => easeFn,
    },
    cancelAnimation: () => {},
    useAnimatedStyle: passthrough,
    useSharedValue: (initial: number) => ({ value: initial }),
    withRepeat: identity,
    withTiming: identity,
  };
});

describe('assistant orb visualizer', () => {
  it('renders the orb stage with the given size and state', () => {
    let tree: renderer.ReactTestRenderer | undefined;
    act(() => {
      tree = renderer.create(
        <AssistantOrb
          size={150}
          color="#1FD5F9"
          state="listening"
          themeMode="light"
          volume={0.5}
        />
      );
    });
    expect(tree!.root.findByProps({ testID: 'assistant-orb' })).not.toBeNull();
    expect(tree!.root.findByType(AssistantOrb).props.state).toBe('listening');
    expect(tree!.toJSON()).not.toBeNull();
  });

  it('renders idle defaults without a track or volume', () => {
    let tree: renderer.ReactTestRenderer | undefined;
    act(() => {
      tree = renderer.create(<AssistantOrb />);
    });
    expect(tree!.root.findByProps({ testID: 'assistant-orb' })).not.toBeNull();
    expect(tree!.root.findByType(AssistantOrb).props.state).toBeUndefined();
  });
});
