import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';
import AssistantOrb from '@/components/AssistantOrb';
import { TypingDots, TypingText } from '@/components/TypingBubble';
import { useConnection } from '@/hooks/useConnection';
import { useConversationDetail } from '@/hooks/useConversations';
import { useDebugMode } from '@/hooks/useDebugMode';
import { useSessionContext } from '@/hooks/useSession';
import { useVoiceTurn } from '@/hooks/useVoiceTurn';
import * as DocumentPicker from 'expo-document-picker';
import {
  parseDocumentReady,
  parseWhatsAppIntent,
  uploadDocumentForConversation,
} from '@/lib/andoraDocuments';
import {
  debugAppendVoiceExchange,
  debugMicScript,
  debugUploadDocument,
} from '@/lib/debugMockBackend';
import {
  generateDemoScenarioPdf,
  randomDemoCaption,
} from '@/lib/demoScenarioPdf';
import { roomNameForConversation } from '@/lib/andoraToken';
import { downloadRemoteFile } from '@/lib/downloadLetterPdf';
import { shareFileToWhatsApp } from '@/lib/shareLetter';
import {
  useAgent,
  useConnectionState,
  useLocalParticipant,
  useMaybeRoomContext,
} from '@livekit/components-react';
import { ConnectionState, RoomEvent } from 'livekit-client';

// FIGMA yguOf0BB6X0G6FBhAVPHb9 node 45-415 -> /assistant.
// Transcript chat: opened with ?conversationId=<id> (&voice=1 to auto-join).
// Text goes through POST /conversations/{id}/messages; voice uses the
// andora-be LiveKit worker (RPC hold/release + andora.turn.* events).
type ChatItem =
  | { kind: 'andora'; id: string; text: string; typing?: boolean }
  | { kind: 'user'; id: string; text: string; typing?: boolean }
  | { kind: 'notice'; id: string; text: string };

// LiveKit ConnectionState -> Indonesian status label.
const connectionStatusText: Record<string, string> = {
  [ConnectionState.Connecting]: 'Menghubungkan...',
  [ConnectionState.Connected]: 'Terhubung',
  [ConnectionState.Reconnecting]: 'Menghubungkan...',
  [ConnectionState.SignalReconnecting]: 'Menghubungkan...',
  [ConnectionState.Disconnected]: 'Terputus',
};

const voiceStatusText: Record<string, string> = {
  recording: 'Merekam... lepaskan untuk selesai',
  processing: 'Andora sedang menjawab...',
  ready: 'Siap. Tekan untuk bicara lagi.',
  failed: 'Suara gagal diproses. Coba lagi.',
};

export default function AssistantChatScreen() {
  const router = useRouter();
  const { conversationId, voice } = useLocalSearchParams<{
    conversationId?: string;
    voice?: string;
  }>();
  const connection = useConnection();
  const { accessToken } = useSessionContext();
  const { debugEnabled } = useDebugMode();
  const room = useMaybeRoomContext();
  // Resolved via SessionProvider room; every use below guards the offline state.
  const connectionState = useConnectionState();
  const { localParticipant } = useLocalParticipant();
  // SessionProvider always supplies session context, so useAgent is safe here
  // even when offline (reports disconnected -> gentle idle pulse).
  const { state: agentState, microphoneTrack } = useAgent();
  const {
    detail,
    loading: detailLoading,
    error: detailError,
    sending,
    send,
    refresh,
  } = useConversationDetail(
    typeof conversationId === 'string' ? conversationId : null
  );
  const [localItems, setLocalItems] = useState<ChatItem[]>([]);
  const [draft, setDraft] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [docNotice, setDocNotice] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [sharingDoc, setSharingDoc] = useState(false);
  const [readyDocs, setReadyDocs] = useState<
    {
      id: string;
      namaDokumen: string;
      url: string;
      localUri?: string;
      fileName?: string;
    }[]
  >([]);
  const [voiceStatusOverride, setVoiceStatusOverride] = useState<
    'recording' | 'processing' | null
  >(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const autoJoinedRef = useRef(false);
  // Demo mic script position per conversation: each hold/release plays
  // the next exchange so bubbles appear one by one like a real talk.
  const micStepRef = useRef<Record<string, number>>({});
  const micHoldRef = useRef<{
    conversationId: string;
    exchangeIndex: number;
    userItemId: string;
    timer: ReturnType<typeof setTimeout> | null;
  } | null>(null);

  const {
    status: liveVoiceStatus,
    holdToTalk,
    releaseToSend,
  } = useVoiceTurn(room, {
    onUserMessage: (msg) => {
      setLocalItems((prev) =>
        prev.some((i) => i.id === msg.id)
          ? prev
          : [...prev, { kind: 'user', id: msg.id, text: msg.content }]
      );
    },
    onAssistantMessage: (msg) => {
      setLocalItems((prev) =>
        prev.some((i) => i.id === msg.id)
          ? prev
          : [...prev, { kind: 'andora', id: msg.id, text: msg.content }]
      );
      void refresh();
    },
    onFetchRequired: () => {
      void refresh();
    },
    onReady: (_id, reason) => {
      if (reason !== 'empty_transcript') void refresh();
    },
    onFailed: () => {
      setLocalItems((prev) => [
        ...prev,
        {
          kind: 'andora',
          id: `voice-failed-${Date.now()}`,
          text: 'Suara gagal diproses. Silakan coba lagi.',
        },
      ]);
    },
  });

  const voiceStatus = voiceStatusOverride ?? liveVoiceStatus;
  const isConnected =
    debugEnabled || connectionState === ConnectionState.Connected;
  const isRecording = voiceStatus === 'recording';
  const isProcessing =
    voiceStatus === 'processing' || voiceStatus === 'recording';

  // Auto-join the andora-{id} voice room when opened with ?voice=1.
  // In debug mode there is no LiveKit room; the mic simulates a full
  // voice turn against the dummy backend instead.
  useEffect(() => {
    if (debugEnabled) return;
    if (
      voice === '1' &&
      typeof conversationId === 'string' &&
      conversationId &&
      !autoJoinedRef.current
    ) {
      autoJoinedRef.current = true;
      connection
        .connect({
          conversationId,
          accessToken: accessToken ?? undefined,
        })
        .catch((e: unknown) => {
          setVoiceError(e instanceof Error ? e.message : String(e));
        });
    }
  }, [voice, conversationId, accessToken, connection, debugEnabled]);

  const items: ChatItem[] = [
    ...(detail?.messages.map(
      (m): ChatItem => ({
        kind: m.role === 'user' ? 'user' : 'andora',
        id: m.id,
        text: m.content,
      })
    ) ?? []),
    // Local-only rows (optimistic text, voice events) not yet in the
    // canonical detail; drop any whose id already arrived via refresh.
    ...localItems.filter(
      (i) => !(detail?.messages.some((m) => m.id === i.id) ?? false)
    ),
  ];

  const sendDraft = async () => {
    const text = draft.trim();
    if (!text || !conversationId || sending) return;
    setDraft('');
    const optimisticId = `user-${Date.now()}`;
    setLocalItems((prev) => [
      ...prev,
      { kind: 'user', id: optimisticId, text },
    ]);
    try {
      // The hook appends the returned turn to the canonical detail state.
      await send(text);
      setLocalItems((prev) => prev.filter((i) => i.id !== optimisticId));
    } catch {
      setLocalItems((prev) => [
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

  const finishTyping = (itemId: string) => {
    setLocalItems((prev) =>
      prev.map((i) =>
        i.id === itemId && (i.kind === 'user' || i.kind === 'andora')
          ? { ...i, typing: false }
          : i
      )
    );
  };

  const handleDocumentReady = (
    namaDokumen: string,
    url: string,
    localUri?: string,
    fileName?: string
  ) => {
    setReadyDocs((prev) =>
      prev.some((d) => d.namaDokumen === namaDokumen && d.url === url)
        ? prev
        : [
            ...prev,
            {
              id: `doc-${Date.now()}`,
              namaDokumen,
              url,
              localUri,
              fileName,
            },
          ]
    );
    setDocNotice(`Dokumen ${namaDokumen} sudah siap.`);
  };

  const handleWhatsAppSignal = async (signal: {
    phoneNumber: string;
    fileUrl: string;
    fileName: string;
    caption?: string;
    localUri?: string;
  }) => {
    setSharingDoc(true);
    setDocError(null);
    try {
      const uri =
        signal.localUri ??
        (await downloadRemoteFile(signal.fileUrl, signal.fileName));
      const type = signal.fileName.toLowerCase().endsWith('.pdf')
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      await shareFileToWhatsApp(uri, {
        mimeType: type,
        filename: signal.fileName,
        message: signal.caption,
      });
      setDocNotice(`WhatsApp terbuka untuk ${signal.phoneNumber}.`);
    } catch (e) {
      setDocError(e instanceof Error ? e.message : String(e));
    } finally {
      setSharingDoc(false);
    }
  };

  // New document signals arrive on the same LiveKit data channel as
  // andora.turn.* events: DOCUMENT_READY shows a download card, and
  // OPEN_WHATSAPP_INTENT downloads the public file then opens WhatsApp.
  useEffect(() => {
    if (!room) return;
    const onData = (payload: Uint8Array) => {
      let data: unknown = null;
      try {
        data = JSON.parse(new TextDecoder().decode(payload)) as unknown;
      } catch {
        return;
      }
      const ready = parseDocumentReady(data);
      if (ready) {
        handleDocumentReady(ready.namaDokumen, ready.url);
        return;
      }
      const intent = parseWhatsAppIntent(data);
      if (intent) {
        void handleWhatsAppSignal(intent);
      }
    };
    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [room]);

  const handlePickDocument = async () => {
    if (typeof conversationId !== 'string' || !conversationId) {
      setDocError('Pilih percakapan dulu sebelum mengunggah dokumen.');
      return;
    }
    if (debugEnabled) {
      setDocError(null);
      setDocNotice(null);
      setUploadingDoc(true);
      try {
        const { roomName: uploadedRoom } = debugUploadDocument(
          roomNameForConversation(conversationId)
        );
        setDocNotice(
          `Dokumen terunggah ke ${uploadedRoom}_latest.pdf. Andora akan membacanya.`
        );
        // Scenario 2: the worker finishes the template as a random PDF.
        const pdf = await generateDemoScenarioPdf();
        handleDocumentReady(pdf.docTitle, pdf.uri, pdf.uri, pdf.fileName);
      } catch (e) {
        setDocError(e instanceof Error ? e.message : String(e));
      } finally {
        setUploadingDoc(false);
      }
      return;
    }
    if (!accessToken) {
      setDocError('Belum masuk. Masuk dulu dengan akun Google.');
      return;
    }
    setDocError(null);
    setDocNotice(null);
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (picked.canceled) return;
      const asset = picked.assets?.[0];
      if (!asset?.uri) {
        throw new Error('Dokumen tidak terbaca. Coba file PDF lain.');
      }
      setUploadingDoc(true);
      await uploadDocumentForConversation(fetch, accessToken, conversationId, {
        uri: asset.uri,
        name: asset.name ?? 'dokumen.pdf',
        mimeType: asset.mimeType ?? 'application/pdf',
      });
      setDocNotice('Dokumen terunggah. Andora akan membacanya.');
    } catch (e) {
      setDocError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploadingDoc(false);
    }
  };

  const openSending = () => {
    if (typeof conversationId !== 'string' || !conversationId) return;
    router.push({
      pathname: '/assistant/sending',
      params: {
        conversationId,
        title: detail?.title ?? 'Surat Andora',
      },
    });
  };

  const handleMicIn = async () => {
    setVoiceError(null);
    if (debugEnabled) {
      const id = typeof conversationId === 'string' ? conversationId : '';
      if (!id) {
        setVoiceError('Pilih percakapan dulu sebelum bicara.');
        return;
      }
      // Ignore a new hold while a demo turn is still playing out.
      if (micHoldRef.current || voiceStatusOverride) return;
      const script = debugMicScript();
      const step = micStepRef.current[id] ?? 0;
      const exchange = script[step % script.length];
      if (!exchange) return;
      setVoiceStatusOverride('recording');
      const userItemId = `mic-user-${Date.now()}`;
      micHoldRef.current = {
        conversationId: id,
        exchangeIndex: step % script.length,
        userItemId,
        // Stage 1 (on hold): user bubble types itself out.
        timer: setTimeout(() => {
          setLocalItems((prev) =>
            prev.some((i) => i.id === userItemId)
              ? prev
              : [
                  ...prev,
                  {
                    kind: 'user',
                    id: userItemId,
                    text: exchange.user,
                    typing: true,
                  },
                ]
          );
        }, 350),
      };
      return;
    }
    try {
      await localParticipant?.setMicrophoneEnabled(true);
    } catch {
      // Track publish failed; RPC below will surface the error.
    }
    try {
      await holdToTalk();
    } catch (e) {
      try {
        await localParticipant?.setMicrophoneEnabled(false);
      } catch {
        // Best effort cleanup.
      }
      setVoiceError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleMicOut = async () => {
    if (debugEnabled) {
      const held = micHoldRef.current;
      micHoldRef.current = null;
      if (held?.timer) {
        clearTimeout(held.timer);
      }
      const id = typeof conversationId === 'string' ? conversationId : '';
      if (!id || !held || held.conversationId !== id) {
        if (!id) {
          setVoiceError('Pilih percakapan dulu sebelum bicara.');
        }
        setVoiceStatusOverride(null);
        return;
      }
      const script = debugMicScript();
      const exchange = script[held.exchangeIndex % script.length];
      if (!exchange) {
        setVoiceStatusOverride(null);
        return;
      }
      setVoiceStatusOverride('processing');
      try {
        const turn = debugAppendVoiceExchange(id, exchange);
        // Stage 2 (on release): Andora bubble appears with typing dots
        // first, then types the reply out. The hold-time user bubble is
        // replaced so each message shows exactly once after refresh.
        const assistantItemId = `mic-andora-${Date.now()}`;
        setLocalItems((prev) => [
          ...prev.filter(
            (i) => i.id !== held.userItemId && i.id !== turn.user_message.id
          ),
          {
            kind: 'andora',
            id: assistantItemId,
            text: '',
            typing: true,
          },
        ]);
        await new Promise((resolve) => setTimeout(resolve, 900));
        setLocalItems((prev) =>
          prev.map((i) =>
            i.id === assistantItemId
              ? {
                  kind: 'andora',
                  id: turn.assistant_message.id,
                  text: turn.assistant_message.content,
                  typing: true,
                }
              : i
          )
        );
        await refresh();
        micStepRef.current[id] = held.exchangeIndex + 1;
        // Final exchange finishes the scenario: random PDF card, then
        // the WhatsApp intent share with the same file.
        if (held.exchangeIndex === script.length - 1) {
          const pdf = await generateDemoScenarioPdf();
          handleDocumentReady(pdf.docTitle, pdf.uri, pdf.uri, pdf.fileName);
          await handleWhatsAppSignal({
            phoneNumber: '6281234567890',
            fileUrl: pdf.uri,
            fileName: pdf.fileName,
            caption: randomDemoCaption(pdf.referenceNo),
            localUri: pdf.uri,
          });
        } else if (held.exchangeIndex === script.length - 2) {
          const pdf = await generateDemoScenarioPdf();
          handleDocumentReady(pdf.docTitle, pdf.uri, pdf.uri, pdf.fileName);
        }
      } catch (e) {
        setVoiceError(e instanceof Error ? e.message : String(e));
      } finally {
        setVoiceStatusOverride(null);
      }
      return;
    }
    try {
      await releaseToSend();
    } catch (e) {
      setVoiceError(e instanceof Error ? e.message : String(e));
    } finally {
      try {
        await localParticipant?.setMicrophoneEnabled(false);
      } catch {
        // Best effort cleanup.
      }
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
        {typeof conversationId === 'string' && conversationId ? (
          <Pressable
            onPress={openSending}
            style={styles.sendCta}
            accessibilityRole="button"
            accessibilityLabel="Kirim surat"
          >
            <Ionicons name="send" size={20} color={Andora.colors.onPrimary} />
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>
      {!isConnected ? (
        <View style={styles.statusBanner}>
          <Text style={styles.statusText}>
            {connection.connectError
              ? `Suara: ${connection.connectError}`
              : !room
              ? 'Mode offline — kirim pesan teks tetap tersimpan ke backend'
              : connectionStatusText[connectionState] ?? 'Terputus'}
          </Text>
        </View>
      ) : null}

      <ScrollView
        ref={scrollRef}
        style={styles.transcript}
        contentContainerStyle={styles.transcriptContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {!conversationId || typeof conversationId !== 'string' ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>
              Pilih percakapan dari tab Pesan untuk mulai.
            </Text>
          </View>
        ) : detailLoading && items.length === 0 ? (
          <View style={styles.stateBox}>
            <ActivityIndicator size="small" color={Andora.colors.primary} />
            <Text style={styles.stateText}>Memuat percakapan...</Text>
          </View>
        ) : detailError && items.length === 0 ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>Gagal memuat: {detailError}</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>
              Belum ada pesan. Ketik di bawah atau tekan mic untuk bicara.
            </Text>
          </View>
        ) : null}
        {items.map((item) => {
          if (item.kind === 'notice') {
            return (
              <View key={item.id} style={styles.stateBox}>
                <Text style={styles.stateText}>{item.text}</Text>
              </View>
            );
          }
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
                  {item.typing ? (
                    <TypingDots color={Andora.colors.textMuted} />
                  ) : (
                    <Text style={styles.andoraText}>{item.text}</Text>
                  )}
                </View>
              </View>
            );
          }
          return (
            <View key={item.id} style={styles.userRow}>
              <View style={styles.userBubble}>
                {item.typing ? (
                  <TypingText
                    text={item.text}
                    style={styles.userText}
                    onDone={() => void finishTyping(item.id)}
                  />
                ) : (
                  <Text style={styles.userText}>{item.text}</Text>
                )}
              </View>
            </View>
          );
        })}
        {isProcessing ? (
          <View style={styles.stateBox}>
            <ActivityIndicator size="small" color={Andora.colors.primary} />
            <Text style={styles.stateText}>
              {voiceStatusText[voiceStatus] ?? 'Andora sedang menjawab...'}
            </Text>
          </View>
        ) : null}
        {voiceError ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>Suara: {voiceError}</Text>
          </View>
        ) : null}
        {docNotice ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>{docNotice}</Text>
          </View>
        ) : null}
        {docError ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>Dokumen: {docError}</Text>
          </View>
        ) : null}
        {uploadingDoc ? (
          <View style={styles.stateBox}>
            <ActivityIndicator size="small" color={Andora.colors.primary} />
            <Text style={styles.stateText}>Mengunggah dokumen...</Text>
          </View>
        ) : null}
        {sharingDoc ? (
          <View style={styles.stateBox}>
            <ActivityIndicator size="small" color={Andora.colors.primary} />
            <Text style={styles.stateText}>Menyiapkan WhatsApp...</Text>
          </View>
        ) : null}
        {readyDocs.map((doc) => (
          <View key={doc.id} style={styles.docCard}>
            <View style={styles.docTop}>
              <Ionicons
                name="document-text"
                size={28}
                color={Andora.colors.primary}
              />
              <Text style={styles.docTitle}>{doc.namaDokumen}</Text>
            </View>
            <Text style={styles.docMeta}>
              {doc.fileName ?? 'Dokumen PDF sudah siap.'}
            </Text>
            <View style={styles.docRow}>
              <Pressable
                onPress={() =>
                  void (async () => {
                    try {
                      const uri =
                        doc.localUri ??
                        (await downloadRemoteFile(doc.url, doc.fileName));
                      await shareFileToWhatsApp(uri, {
                        mimeType: 'application/pdf',
                        filename: doc.fileName ?? 'surat-andora.pdf',
                        message: `Berikut ${doc.namaDokumen} dari Andora.`,
                      });
                    } catch (e) {
                      setDocError(e instanceof Error ? e.message : String(e));
                    }
                  })()
                }
                style={styles.docCta}
                accessibilityRole="button"
                accessibilityLabel={`Kirim ${doc.namaDokumen} via WhatsApp`}
              >
                <Ionicons
                  name="logo-whatsapp"
                  size={18}
                  color={Andora.colors.onPrimary}
                />
                <Text style={styles.docCtaText}>Kirim via WhatsApp</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  void (async () => {
                    try {
                      const uri =
                        doc.localUri ??
                        (await downloadRemoteFile(doc.url, doc.fileName));
                      setDocNotice(`Dokumen tersimpan di ${uri}.`);
                    } catch (e) {
                      setDocError(e instanceof Error ? e.message : String(e));
                    }
                  })()
                }
                style={styles.docGhostCta}
                accessibilityRole="button"
                accessibilityLabel={`Unduh ${doc.namaDokumen}`}
              >
                <Ionicons
                  name="download"
                  size={18}
                  color={Andora.colors.primary}
                />
                <Text style={styles.docGhostCtaText}>Download</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.composer}>
          <View style={styles.inputRow}>
            <Pressable
              onPress={() => void handlePickDocument()}
              style={styles.attachButton}
              accessibilityRole="button"
              accessibilityLabel="Unggah dokumen PDF"
              disabled={uploadingDoc}
            >
              <Ionicons name="attach" size={22} color={Andora.colors.primary} />
            </Pressable>
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
            <AssistantOrb
              size={150}
              color="#1FD5F9"
              state={agentState}
              themeMode="light"
              audioTrack={microphoneTrack ?? undefined}
              style={isRecording ? styles.orbOuterActive : undefined}
            />
            <Text style={styles.micLabel}>
              Tekan untuk bicara, Lepas untuk selesai
            </Text>
            {isRecording ? (
              <Text style={styles.recordingHint}>
                Merekam... lepaskan untuk selesai
              </Text>
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
  sendCta: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Andora.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  docMeta: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.medium,
  },
  docCta: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Andora.colors.primary,
    borderRadius: 10,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Andora.spacing.md,
  },
  docCtaText: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.bold,
  },
  docRow: { flexDirection: 'row', gap: 8 },
  docGhostCta: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: Andora.colors.borderStrong,
    borderRadius: 10,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Andora.spacing.md,
  },
  docGhostCtaText: {
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.bold,
  },
  stateBox: {
    backgroundColor: Andora.colors.surface,
    borderWidth: 1,
    borderColor: Andora.colors.border,
    borderRadius: 10,
    padding: Andora.spacing.sm,
    alignItems: 'center',
    gap: 6,
  },
  stateText: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.semibold,
    textAlign: 'center',
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
  attachButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Andora.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Andora.colors.border,
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
