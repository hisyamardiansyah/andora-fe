import { useEffect, useState } from 'react';
import {
  Image,
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
import AndoraNavbar from '@/components/AndoraNavbar';
import { useSessionContext } from '@/hooks/useSession';

export default function ProfilePersonalScreen() {
  const router = useRouter();
  const { user } = useSessionContext();
  const sessionName =
    (typeof user?.user_metadata?.full_name === 'string' &&
      user.user_metadata.full_name) ||
    (typeof user?.user_metadata?.name === 'string' &&
      user.user_metadata.name) ||
    '';
  const [name, setName] = useState(sessionName);
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(
    typeof user?.user_metadata?.phone === 'string'
      ? user.user_metadata.phone
      : ''
  );
  const [address, setAddress] = useState('');
  const [saved, setSaved] = useState(false);

  // Sync once the session user resolves (initial render may be anonymous).
  useEffect(() => {
    if (sessionName) setName((prev) => prev || sessionName);
    if (user?.email) setEmail((prev) => prev || (user.email ?? ''));
  }, [sessionName, user]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={Andora.colors.primary}
            />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>Informasi Pribadi</Text>
            <Text style={styles.subtitle}>Lihat dan ubah data diri</Text>
          </View>
        </View>

        <View style={styles.avatarBlock}>
          <Image
            source={require('../../assets/images/profile-avatar.png')}
            style={styles.avatar}
            accessibilityLabel="Foto profil"
          />
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nama Lengkap</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Nama Lengkap"
          />
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.label}>No. Telepon</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            placeholder="No. Telepon"
            keyboardType="phone-pad"
          />
          <Text style={styles.label}>Alamat</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            style={styles.input}
            placeholder="Alamat"
          />
        </View>

        <Pressable
          onPress={() => setSaved(true)}
          style={styles.saveButton}
          accessibilityRole="button"
        >
          <Text style={styles.saveText}>Simpan</Text>
        </Pressable>
        {saved ? <Text style={styles.savedText}>Tersimpan</Text> : null}
      </ScrollView>
      <AndoraNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Andora.colors.background },
  scroll: { padding: Andora.spacing.lg, paddingBottom: Andora.spacing.xl },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Andora.spacing.sm,
    marginBottom: Andora.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Andora.colors.surface,
    borderWidth: 1,
    borderColor: Andora.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title: {
    color: Andora.colors.text,
    fontSize: 30,
    fontWeight: Andora.typography.weight.bold,
  },
  subtitle: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.semibold,
  },
  avatarBlock: {
    alignItems: 'center',
    marginBottom: Andora.spacing.md,
    position: 'relative',
  },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  cameraBadge: {
    position: 'absolute',
    right: '38%',
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Andora.colors.bubbleUser,
    borderWidth: 2,
    borderColor: Andora.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: { gap: Andora.spacing.sm, marginBottom: Andora.spacing.md },
  label: {
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.semibold,
  },
  input: {
    backgroundColor: Andora.colors.surface,
    borderWidth: 1,
    borderColor: Andora.colors.border,
    borderRadius: 10,
    paddingHorizontal: Andora.spacing.md,
    paddingVertical: 12,
    color: Andora.colors.text,
    fontSize: Andora.typography.size.bodyLarge,
  },
  saveButton: {
    backgroundColor: Andora.colors.primary,
    borderRadius: 10,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.bold,
  },
  savedText: {
    color: Andora.colors.success,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.semibold,
    textAlign: 'center',
    marginTop: Andora.spacing.sm,
  },
});
