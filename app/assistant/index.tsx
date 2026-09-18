import React, { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  AudioSession,
  useIOSAudioManagement,
  useRoomContext,
} from '@livekit/react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AgentVisualization from './ui/AgentVisualization';
import { useConnection } from '@/hooks/useConnection';
import { Andora } from '@/constants/Andora';

export default function AssistantScreen() {
  useEffect(() => {
    let start = async () => {
      await AudioSession.startAudioSession();
    };

    start();
    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <RoomView />
    </SafeAreaView>
  );
}

const RoomView = () => {
  const router = useRouter();
  const connection = useConnection();
  const room = useRoomContext();

  useIOSAudioManagement(room, true);

  const onExitClick = useCallback(() => {
    connection.disconnect();
    router.back();
  }, [connection, router]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Andora</Text>
      <View style={styles.center}>
        <AgentVisualization style={styles.orb} />
        <View style={styles.copy}>
          <Text style={styles.title}>Andora Mendengarkan...</Text>
          <Text style={styles.subtitle}>
            Silakan deskripsikan kebutuhan dokumen anda
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Pressable
          onPress={onExitClick}
          style={styles.cancelButton}
          accessibilityRole="button"
        >
          <Ionicons name="close" size={18} color={Andora.colors.primary} />
          <Text style={styles.cancelText}>Batalkan</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Andora.colors.background,
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: Andora.colors.background,
  },
  header: {
    color: Andora.colors.text,
    fontSize: 30,
    fontWeight: Andora.typography.weight.bold,
    textAlign: 'center',
    marginTop: Andora.spacing.md,
  },
  center: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    width: 249,
    height: 315,
  },
  copy: {
    width: 312,
    gap: 12,
    alignItems: 'center',
    marginTop: Andora.spacing.lg,
  },
  title: {
    color: Andora.colors.text,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.bold,
    textAlign: 'center',
  },
  subtitle: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.semibold,
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: Andora.spacing.xl,
  },
  cancelButton: {
    flexDirection: 'row',
    width: 178,
    height: 55,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Andora.colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Andora.spacing.sm,
    backgroundColor: Andora.colors.background,
  },
  cancelText: {
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.semibold,
  },
});
