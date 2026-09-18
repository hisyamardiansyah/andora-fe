import { useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';
import AgentAuraGL from '@/components/AgentAuraGL';
import { useConnection } from '@/hooks/useConnection';
import {
  useAgent,
  useChat,
  useConnectionState,
  useLocalParticipant,
  useMaybeRoomContext,
} from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';

// FIGMA yguOf0BB6X0G6FBhAVPHb9 node 45-415 -> /assistant.
// Transcript chat: home mic lands here, "Ya, Kirim Sekarang" -> /assistant/sending.
type ChatItem =
  | { kind: 'andora'; id: string; text: string }
  | { kind: 'user'; id: string; text: string }
  | { kind: 'doc'; id: string }
  | { kind: 'ctas'; id: string };

const SEED: ChatItem[] = [
  { kind: 'andora', id: 'a1', text: 'Silakan deskripsikan kebutuhan dokumen anda' },
  {
    kind: 'andora',
    id: 'a2',
    text: 'Baik, Andora akan membuatkan pemohonan Surat Keterangan Tidak Mampu. Saya ingin memastikan, Apakah tujuan keperluan surat ini untuk kuliah atau kegiatan lainnya?',
  },
  { kind: 'user', id: 'u1', text: 'Untuk keperluan kuliah' },
  { kind: 'andora', id: 'a3', text: 'Kapan surat ini akan digunakan?' },
  { kind: 'user', id: 'u2', text: 'Tanggal 22 September 2026' },
  {
    kind: 'andora',
    id: 'a4',
    text: 'Selanjutnya, untuk melengkapi data Anda, silakan jawab beberapa pertanyaan berikut: Pertama, sebutkan nama lengkap pemohon atau penanggung jawab keluarga.',
  },
  { kind: 'user', id: 'u3', text: 'Nama lengkap saya Zoe Atasya Nahaya.' },
  {
    kind: 'andora',
    id: 'a5',
    text: 'Lalu, sebutkan Nomor Induk Kependudukan (NIK) dan Nomor Kartu Keluarga (KK) Anda.',
  },
  {
    kind: 'user',
    id: 'u4',
    text: 'NIK saya 167115644256 dan Nomor KK saya 167118901',
  },
  {
    kind: 'andora',
    id: 'a6',
    text: 'Silakan buka dan cek dokumen. Jika sudah sesuai, Anda bisa memberi Andora perintah untuk mengirim dokumen tersebut.',
  },
  { kind: 'doc', id: 'doc1' },
  {
    kind: 'user',
    id: 'u5',
    text: 'Baik sekali, sudah sesuai! Sekarang tolong kirimkan melalui WhatsApp ke kontak Akademik Fakultas Ilmu Budaya UGM di WA saya',
  },
  {
    kind: 'andora',
    id: 'a7',
    text: 'Baik, saya akan mengirim surat ini melalui WhatsApp. Tujuannya ke kontak Akademik Fakultas Ilmu Budaya UGM. Apakah Anda yakin ingin mengirim sekarang?',
  },
  { kind: 'ctas', id: 'ctas1' },
];

// LiveKit ConnectionState -> Indonesian status label.
const connectionStatusText: Record<string, string> = {
  [ConnectionState.Connecting]: 'Menghubungkan...',
  [ConnectionState.Connected]: 'Terhubung',
  [ConnectionState.Reconnecting]: 'Menghubungkan...',
  [ConnectionState.SignalReconnecting]: 'Menghubungkan...',
  [ConnectionState.Disconnected]: 'Terputus',
};

export default function AssistantChatScreen() {
  const router = useRouter();
  const connection = useConnection();
  const room = useMaybeRoomContext();
  // Resolved via SessionProvider room; every use below guards the offline state.
  const { send, chatMessages } = useChat();
  const connectionState = useConnectionState();
  const { localParticipant } = useLocalParticipant();
  // SessionProvider always supplies session context, so useAgent is safe here
  // even when offline (reports disconnected -> gentle idle pulse).
  const { state: agentState, microphoneTrack } = useAgent();
  const [items, setItems] = useState<ChatItem[]>(SEED);
  const [draft, setDraft] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const seenChatIds = useRef<Set<string>>(new Set());

  const isConnected = connectionState === ConnectionState.Connected;

  // Append unseen LiveKit messages below the SEED transcript.
  useEffect(() => {
    const unseen = chatMessages.filter((m) => !seenChatIds.current.has(m.id));
    if (unseen.length === 0) return;
    for (const m of unseen) seenChatIds.current.add(m.id);
    setItems((prev) => [
      ...prev,
      ...unseen.map(
        (m): ChatItem => ({
          kind: m.from?.isLocal ? 'user' : 'andora',
          id: `live-${m.id}`,
          text: m.message,
        })
      ),
    ]);
  }, [chatMessages]);

  const sendDraft = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    setItems((prev) => [...prev, { kind: 'user', id: `user-${Date.now()}`, text }]);
    if (!room || !isConnected) return;
    try {
      await send(text);
    } catch {
      setItems((prev) => [
        ...prev,
        {
          kind: 'andora',
          id: `send-err-${Date.now()}`,
          text: 'Gagal mengirim pesan. Periksa koneksi lalu coba lagi.',
        },
      ]);
    }
  };

  const handleBack = () => {
    try {
      connection.disconnect();
    } catch {
      // Offline: nothing to disconnect.
    }
    router.back();
  };

  const handleMicIn = () => {
    setIsRecording(true);
    try {
      void localParticipant?.setMicrophoneEnabled(true);
    } catch {
      // Offline: visual hold-to-talk only.
    }
  };

  const handleMicOut = () => {
    setIsRecording(false);
    try {
      void localParticipant?.setMicrophoneEnabled(false);
    } catch {
      // Offline: visual hold-to-talk only.
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
        >
          <Ionicons name="chevron-back" size={28} color={Andora.colors.text} />
        </Pressable>
        <View style={styles.brandRow}>
          <Image
            source={require('../../assets/images/andora-logo-icon1.png')}
            style={styles.logo}
          />
          <Text style={styles.brand}>Andora</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
      {!isConnected ? (
        <View style={styles.statusBanner}>
          <Text style={styles.statusText}>
            {!room
              ? 'Mode offline — pesan tersimpan lokal'
              : (connectionStatusText[connectionState] ?? 'Terputus')}
          </Text>
        </View>
      ) : null}

      <ScrollView
        ref={scrollRef}
        style={styles.transcript}
        contentContainerStyle={styles.transcriptContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {items.map((item) => {
          if (item.kind === 'andora') {
            return (
              <View key={item.id} style={styles.andoraRow}>
                <View style={styles.avatar}>
                  <Ionicons
                    name="document-text"
                    size={28}
                    color={Andora.colors.onPrimary}
                  />
                </View>
                <View style={styles.andoraBubble}>
                  <Text style={styles.andoraText}>{item.text}</Text>
                </View>
              </View>
            );
          }
          if (item.kind === 'user') {
            return (
              <View key={item.id} style={styles.userRow}>
                <View style={styles.userBubble}>
                  <Text style={styles.userText}>{item.text}</Text>
                </View>
              </View>
            );
          }
          if (item.kind === 'doc') {
            return (
              <View key={item.id} style={styles.docCard}>
                <View style={styles.docTop}>
                  <Ionicons
                    name="document-text"
                    size={66}
                    color={Andora.colors.primary}
                  />
                  <Text style={styles.docTitle}>Surat keterangan tidak mampu</Text>
                </View>
                <View style={styles.docRows}>
                  <Text style={styles.docLabel}>Penerima Tujuan</Text>
                  <Text style={styles.docValue}>
                    Akademik Fakultas Ilmu Budaya UGM
                  </Text>
                </View>
                <Text style={styles.docOpen}>Buka</Text>
              </View>
            );
          }
          return (
            <View key={item.id} style={styles.ctaBlock}>
              <Pressable
                onPress={() => router.push('/assistant/sending')}
                style={styles.primaryCta}
                accessibilityRole="button"
              >
                <Text style={styles.primaryCtaText}>Ya, Kirim Sekarang</Text>
              </Pressable>
              <Pressable
                onPress={handleBack}
                style={styles.secondaryCta}
                accessibilityRole="button"
              >
                <Text style={styles.secondaryCtaText}>
                  Nanti saja/Simpan sebagai draf
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.composer}>
          <View style={styles.inputRow}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Ketik atau langsung bicara"
              placeholderTextColor={Andora.colors.inputPlaceholder}
              style={styles.input}
              returnKeyType="send"
              onSubmitEditing={sendDraft}
            />
            <Pressable
              onPress={sendDraft}
              style={styles.sendButton}
              accessibilityRole="button"
              accessibilityLabel="Kirim pesan"
            >
              <Ionicons name="send" size={22} color={Andora.colors.onPrimary} />
            </Pressable>
          </View>

          {/* Hold-to-talk enables the live mic when connected; visual only offline. */}
          <Pressable
            onPressIn={handleMicIn}
            onPressOut={handleMicOut}
            style={styles.micWrap}
            accessibilityRole="button"
            accessibilityLabel="Tekan untuk bicara"
          >
            <AgentAuraGL
              size={150}
              color="#1FD5F9"
              colorShift={0.3}
              state={agentState}
              themeMode="light"
              audioTrack={microphoneTrack ?? undefined}
              micIconSize={38}
              style={isRecording ? styles.orbOuterActive : undefined}
            />
            <Text style={styles.micLabel}>
              Tekan untuk bicara, Lepas untuk selesai
            </Text>
            {isRecording ? (
              <Text style={styles.recordingHint}>Merekam... lepaskan untuk selesai</Text>
            ) : null}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Andora.colors.background },
  header: {
    backgroundColor: Andora.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Andora.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Andora.spacing.sm,
    paddingVertical: Andora.spacing.sm,
  },
  backButton: { width: 44, alignItems: 'flex-start', justifyContent: 'center' },
  brandRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Andora.spacing.sm,
  },
  logo: { width: 39, height: 39, resizeMode: 'contain' },
  brand: {
    color: Andora.colors.text,
    fontSize: 30,
    fontWeight: Andora.typography.weight.bold,
  },
  headerSpacer: { width: 44 },
  statusBanner: {
    backgroundColor: Andora.colors.reminderBg,
    borderBottomWidth: 1,
    borderBottomColor: Andora.colors.border,
    paddingVertical: Andora.spacing.xs,
    paddingHorizontal: Andora.spacing.md,
    alignItems: 'center',
  },
  statusText: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.semibold,
    textAlign: 'center',
  },
  transcript: { flex: 1 },
  transcriptContent: {
    paddingHorizontal: Andora.spacing.md,
    paddingVertical: Andora.spacing.md,
    gap: Andora.spacing.md,
    paddingBottom: Andora.spacing.xl,
  },
  andoraRow: { flexDirection: 'row', gap: 4, alignItems: 'flex-start' },
  avatar: {
    width: 57,
    height: 57,
    borderRadius: 28.5,
    backgroundColor: Andora.colors.bubbleUser,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
    marginTop: 8,
    zIndex: 1,
  },
  andoraBubble: {
    flex: 1,
    backgroundColor: Andora.colors.surface,
    borderWidth: 1,
    borderColor: Andora.colors.borderStrong,
    borderRadius: 10,
    padding: Andora.spacing.sm,
    marginLeft: -14,
    paddingLeft: 22,
  },
  andoraText: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.semibold,
  },
  userRow: { alignItems: 'flex-end' },
  userBubble: {
    maxWidth: '85%',
    backgroundColor: Andora.colors.bubbleUser,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 5,
    paddingHorizontal: Andora.spacing.md,
    paddingVertical: Andora.spacing.sm,
  },
  userText: {
    color: Andora.colors.onPrimary,
    fontSize: 18,
    fontWeight: Andora.typography.weight.semibold,
  },
  docCard: {
    backgroundColor: Andora.colors.surface,
    borderWidth: 1,
    borderColor: Andora.colors.borderStrong,
    borderRadius: 10,
    padding: Andora.spacing.sm,
    gap: Andora.spacing.sm,
  },
  docTop: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  docTitle: {
    flex: 1,
    color: Andora.colors.text,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.semibold,
  },
  docRows: { gap: 2 },
  docLabel: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.medium,
  },
  docValue: {
    color: Andora.colors.bubbleUser,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.semibold,
  },
  docOpen: {
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.semibold,
    textAlign: 'right',
  },
  ctaBlock: { gap: Andora.spacing.sm, alignItems: 'center' },
  primaryCta: {
    width: '100%',
    maxWidth: 380,
    height: 55,
    borderRadius: 20,
    backgroundColor: Andora.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCtaText: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.bold,
  },
  secondaryCta: {
    width: '100%',
    maxWidth: 380,
    height: 55,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Andora.colors.borderStrong,
    backgroundColor: Andora.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryCtaText: {
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.semibold,
  },
  composer: {
    backgroundColor: Andora.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Andora.colors.border,
    paddingHorizontal: Andora.spacing.md,
    paddingTop: Andora.spacing.sm,
    paddingBottom: Andora.spacing.md,
    gap: Andora.spacing.sm,
    alignItems: 'center',
  },
  inputRow: {
    width: '100%',
    flexDirection: 'row',
    gap: Andora.spacing.sm,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Andora.colors.inputBg,
    borderRadius: 20,
    minHeight: 48,
    paddingHorizontal: Andora.spacing.md,
    color: Andora.colors.inputFilled,
    fontSize: Andora.typography.size.bodyLarge,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Andora.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micWrap: { alignItems: 'center', gap: 6 },
  orbOuterActive: { transform: [{ scale: 1.08 }] },
  micLabel: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.semibold,
    textAlign: 'center',
  },
  recordingHint: {
    color: Andora.colors.danger,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.semibold,
    textAlign: 'center',
  },
});
