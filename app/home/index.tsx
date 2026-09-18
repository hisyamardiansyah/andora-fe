import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';
import AndoraNavbar from '@/components/AndoraNavbar';
import AgentAuraGL from '@/components/AgentAuraGL';
import { useConnection } from '@/hooks/useConnection';
import { useConversationList } from '@/hooks/useConversations';
import { useDebugMode } from '@/hooks/useDebugMode';
import { useSessionContext } from '@/hooks/useSession';
import { useAgent } from '@livekit/components-react';

// FIGMA Andora (Copy) 7IHCYJs2bVqT4uzuCJKzhF node 11-6 -> /home.
// Dark brand screen, reminder card, mic CTA, bottom navbar.
// Reminder card shows the latest backend conversation when available.
export default function HomeScreen() {
  const router = useRouter();
  const connection = useConnection();
  const { accessToken } = useSessionContext();
  const { debugEnabled } = useDebugMode();
  const { items, loading } = useConversationList();
  // SessionProvider always supplies session context, so useAgent is safe here
  // even before connect (reports disconnected -> gentle idle pulse).
  const { state: agentState, microphoneTrack } = useAgent();
  const latest = items[0];

  // Open (or reuse) a conversation, then join its andora-{id} voice room.
  const startVoice = async (conversationId?: string) => {
    if (conversationId) {
      router.push({
        pathname: '/assistant',
        params: { conversationId, voice: '1' },
      });
    } else {
      router.push('/assistant');
    }
    try {
      await connection.connect({
        conversationId,
        accessToken: accessToken ?? undefined,
      });
    } catch {
      // Assistant screen shows the offline state.
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <Text style={styles.brand}>Andora</Text>
          {debugEnabled ? (
            <View style={styles.debugPill}>
              <Text style={styles.debugPillText}>DEBUG</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.reminder}>
          <View style={styles.reminderHeader}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color={Andora.colors.onPrimary}
            />
            <Text style={styles.reminderTitle}>Pengingat Ramah</Text>
          </View>
          <View style={styles.reminderCard}>
            {loading ? (
              <View style={styles.reminderLoading}>
                <ActivityIndicator size="small" color={Andora.colors.primary} />
                <Text style={styles.reminderBody}>Memuat percakapan...</Text>
              </View>
            ) : latest ? (
              <>
                <View style={styles.reminderTop}>
                  <View style={styles.reminderText}>
                    <Text style={styles.reminderHeading}>{latest.title}</Text>
                    {latest.last_message_preview ? (
                      <Text style={styles.reminderBody} numberOfLines={2}>
                        {latest.last_message_preview}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <View style={styles.reminderCtaRow}>
                  <Pressable
                    onPress={() => void startVoice(latest.id)}
                    style={styles.reminderCta}
                    accessibilityRole="button"
                  >
                    <Text style={styles.reminderCtaText}>Lanjutkan Bicara</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={styles.reminderLoading}>
                <Text style={styles.reminderBody}>
                  Belum ada percakapan. Tekan mic di bawah untuk mulai.
                </Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.greeting}>
          Halo, saya Andora. Ada yang bisa saya bantu untuk mengurus dokumen?
        </Text>

        <Pressable
          onPressIn={() => void startVoice(latest?.id)}
          style={styles.micWrap}
          accessibilityRole="button"
          accessibilityLabel="Tekan untuk bicara"
        >
          <AgentAuraGL
            size={197}
            color="#1FD5F9"
            colorShift={0.3}
            state={agentState}
            themeMode="dark"
            audioTrack={microphoneTrack ?? undefined}
            micIconSize={38}
          />
          <Text style={styles.micLabel}>Tekan untuk bicara</Text>
        </Pressable>
      </ScrollView>
      <AndoraNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1f3247' },
  scroll: {
    paddingHorizontal: Andora.spacing.md,
    paddingTop: Andora.spacing.md,
    paddingBottom: Andora.spacing.xl,
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Andora.spacing.md,
  },
  debugPill: {
    backgroundColor: Andora.colors.warning,
    borderRadius: Andora.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  debugPillText: {
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.caption,
    fontWeight: Andora.typography.weight.bold,
    letterSpacing: 1,
  },
  brand: {
    color: Andora.colors.onPrimary,
    fontSize: 30,
    fontWeight: Andora.typography.weight.bold,
    textAlign: 'center',
  },
  reminder: {
    width: 380,
    maxWidth: '100%',
    marginBottom: Andora.spacing.lg,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: Andora.spacing.xs,
  },
  reminderTitle: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.bold,
  },
  reminderCard: {
    backgroundColor: Andora.colors.reminderBg,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  reminderTop: {
    flexDirection: 'row',
    gap: Andora.spacing.sm,
    alignItems: 'flex-start',
  },
  reminderText: { flex: 1, gap: 5 },
  reminderHeading: {
    color: Andora.colors.reminderTitle,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.semibold,
    width: 181,
  },
  reminderBody: {
    color: Andora.colors.primaryMuted,
    fontSize: Andora.typography.size.bodyLarge,
  },
  reminderLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  reminderCtaRow: {
    paddingTop: 7,
    alignItems: 'flex-end',
  },
  reminderCta: {
    backgroundColor: Andora.colors.brandDeep,
    borderRadius: 10,
    width: 140,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderCtaText: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.bold,
  },
  greeting: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.semibold,
    lineHeight: Andora.typography.lineHeight.relaxed,
    textAlign: 'center',
    width: 312,
    marginBottom: Andora.spacing.lg,
  },
  micWrap: { alignItems: 'center', gap: 5, marginBottom: Andora.spacing.lg },
  micLabel: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.bold,
    textAlign: 'center',
  },
});
