import React from 'react';
import renderer, { act } from 'react-test-renderer';
import AgentAuraGL from '@/components/AgentAuraGL';

jest.mock('@livekit/react-native', () => ({
  useTrackVolume: () => 0.5,
}));

jest.mock('@/components/MicAura', () => {
  const { View } = require('react-native');
  return function MockMicAura(props: any) {
    return <View testID="mic-aura-fallback" {...props} />;
  };
});

jest.mock(
  'expo-gl',
  () => ({}),
  { virtual: true }
);

describe('assistant mic entry renders Aura with centered mic', () => {
  it('falls back to the aura surface with non-zero size and mic icon', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <AgentAuraGL
          size={150}
          color="#1FD5F9"
          colorShift={0.3}
          state="listening"
          themeMode="light"
          volume={0.5}
          micIconSize={38}
        />
      );
    });
    const json = tree.toJSON() as any;
    expect(json).not.toBeNull();
    expect(json.props.testID).toBe('mic-aura-fallback');
    expect(json.props.state).toBe('listening');
    expect(json.props.volume).toBe(0.5);
    expect(json.props.size).toBe(150);
    expect(json.props.showMicIcon).not.toBe(false);
  });
});
