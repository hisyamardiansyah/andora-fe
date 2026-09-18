import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DebugProvider, useDebugMode } from '../hooks/useDebugMode';

jest.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key: string) => store[key] ?? null),
      setItem: jest.fn(async (key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn(async (key: string) => {
        delete store[key];
      }),
    },
  };
});

type DebugState = ReturnType<typeof useDebugMode>;

function Probe({ capture }: { capture: (state: DebugState) => void }) {
  const state = useDebugMode();
  capture(state);
  return (
    <Text testID="debug-flag">
      {state.loading ? 'loading' : state.debugEnabled ? 'on' : 'off'}
    </Text>
  );
}

function flagText(tree: renderer.ReactTestRenderer): string {
  const node = tree.root.findByProps({ testID: 'debug-flag' });
  const kids = node.props.children as string | string[];
  return Array.isArray(kids) ? kids.join('') : String(kids);
}

describe('debug mode provider', () => {
  it('defaults off, then enables and disables with persistence', async () => {
    let captured: DebugState | null = null;
    let tree: renderer.ReactTestRenderer | undefined;
    await act(async () => {
      tree = renderer.create(
        <DebugProvider>
          <Probe
            capture={(state) => {
              captured = state;
            }}
          />
        </DebugProvider>
      );
    });
    expect(flagText(tree!)).toBe('off');

    await act(async () => {
      await captured!.enableDebug();
    });
    expect(flagText(tree!)).toBe('on');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('andora.debug-mode', '1');

    await act(async () => {
      await captured!.disableDebug();
    });
    expect(flagText(tree!)).toBe('off');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('andora.debug-mode');
  });

  it('restores a persisted debug flag on mount', async () => {
    await AsyncStorage.setItem('andora.debug-mode', '1');
    let tree: renderer.ReactTestRenderer | undefined;
    await act(async () => {
      tree = renderer.create(
        <DebugProvider>
          <Probe capture={() => {}} />
        </DebugProvider>
      );
    });
    expect(flagText(tree!)).toBe('on');
    await AsyncStorage.removeItem('andora.debug-mode');
  });
});
