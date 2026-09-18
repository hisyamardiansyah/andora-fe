// Runtime debug mode: explore all FE screens without a live backend.
// The flag is persisted in AsyncStorage so the installed APK stays in
// debug mode across restarts until explicitly exited from Profile.
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'andora.debug-mode';

interface DebugModeContextType {
  debugEnabled: boolean;
  loading: boolean;
  enableDebug: () => Promise<void>;
  disableDebug: () => Promise<void>;
}

const DebugModeContext = createContext<DebugModeContextType>({
  debugEnabled: false,
  loading: true,
  enableDebug: async () => {},
  disableDebug: async () => {},
});

export function useDebugMode() {
  const ctx = useContext(DebugModeContext);
  if (!ctx) {
    throw new Error('useDebugMode must be used within DebugProvider');
  }
  return ctx;
}

export function DebugProvider({ children }: { children: React.ReactNode }) {
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (active) setDebugEnabled(value === '1');
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const enableDebug = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEY, '1');
    setDebugEnabled(true);
  }, []);

  const disableDebug = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setDebugEnabled(false);
  }, []);

  const value = useMemo(
    () => ({ debugEnabled, loading, enableDebug, disableDebug }),
    [debugEnabled, loading, enableDebug, disableDebug]
  );

  return (
    <DebugModeContext.Provider value={value}>
      {children}
    </DebugModeContext.Provider>
  );
}
