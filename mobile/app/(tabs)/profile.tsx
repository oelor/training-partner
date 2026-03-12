import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { updateProfile, uploadAvatar } from '../../lib/api';
import { colors, spacing, borderRadius, fonts } from '../../lib/theme';

const SPORTS = ['BJJ', 'MMA', 'Boxing', 'Muay Thai', 'Wrestling', 'Judo', 'Kickboxing', 'Sambo'];
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];
const WEIGHT_CLASSES = ['Flyweight', 'Bantamweight', 'Featherweight', 'Lightweight', 'Welterweight', 'Middleweight', 'Light Heavyweight', 'Heavyweight'];

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    city: user?.city || '',
    bio: user?.bio || '',
    sport: user?.sport || '',
    skill_level: user?.skill_level || '',
    weight_class: user?.weight_class || '',
  });

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      await refreshUser();
      setEditing(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [form, refreshUser]);

  const handlePickAvatar = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setUploadingAvatar(true);
      try {
        await uploadAvatar(result.assets[0].base64);
        await refreshUser();
        Alert.alert('Success', 'Avatar updated!');
      } catch (err: unknown) {
        Alert.alert('Error', err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploadingAvatar(false);
      }
    }
  }, [refreshUser]);

  const handleLogout = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }, [logout]);

  if (!user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={handlePickAvatar} disabled={uploadingAvatar}>
          {user.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{user.name?.[0]?.toUpperCase() || '?'}</Text>
            </View>
          )}
          <View style={styles.avatarEditBadge}>
            {uploadingAvatar ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.avatarEditIcon}>📷</Text>
            )}
          </View>
        </TouchableOpacity>

        {!editing && (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.sport && <Text style={styles.userSport}>{user.sport}</Text>}
          </View>
        )}
      </View>

      {/* Edit / View Toggle */}
      {!editing ? (
        <>
          {/* Profile Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROFILE</Text>
            <ProfileRow label="City" value={user.city} />
            <ProfileRow label="Sport" value={user.sport} />
            <ProfileRow label="Skill Level" value={user.skill_level} />
            <ProfileRow label="Weight Class" value={user.weight_class} />
            <ProfileRow label="Bio" value={user.bio} multiline />
          </View>

          <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
            <Text style={styles.editButtonText}>EDIT PROFILE</Text>
          </TouchableOpacity>

          {/* Settings Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MORE</Text>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/community')}>
              <Text style={styles.menuItemText}>📢 Community</Text>
              <Text style={styles.menuItemArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/notifications')}>
              <Text style={styles.menuItemText}>🔔 Notifications</Text>
              <Text style={styles.menuItemArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings')}>
              <Text style={styles.menuItemText}>⚙️ Settings</Text>
              <Text style={styles.menuItemArrow}>→</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>SIGN OUT</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* Edit Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EDIT PROFILE</Text>

            <FormField label="NAME" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
            <FormField label="CITY" value={form.city} onChangeText={(v) => setForm({ ...form, city: v })} placeholder="Your city" />
            <FormField label="BIO" value={form.bio} onChangeText={(v) => setForm({ ...form, bio: v })} multiline placeholder="Tell others about yourself..." />

            <Text style={styles.fieldLabel}>PRIMARY SPORT</Text>
            <View style={styles.chipGrid}>
              {SPORTS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, form.sport === s && styles.chipActive]}
                  onPress={() => setForm({ ...form, sport: s })}
                >
                  <Text style={[styles.chipText, form.sport === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>SKILL LEVEL</Text>
            <View style={styles.chipGrid}>
              {SKILL_LEVELS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, form.skill_level === s && styles.chipActive]}
                  onPress={() => setForm({ ...form, skill_level: s })}
                >
                  <Text style={[styles.chipText, form.skill_level === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>WEIGHT CLASS</Text>
            <View style={styles.chipGrid}>
              {WEIGHT_CLASSES.map((w) => (
                <TouchableOpacity
                  key={w}
                  style={[styles.chip, form.weight_class === w && styles.chipActive]}
                  onPress={() => setForm({ ...form, weight_class: w })}
                >
                  <Text style={[styles.chipText, form.weight_class === w && styles.chipTextActive]}>{w}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditing(false)}
            >
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.saveButtonText}>SAVE</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function ProfileRow({ label, value, multiline }: { label: string; value?: string; multiline?: boolean }) {
  if (!value) return null;
  return (
    <View style={styles.profileRow}>
      <Text style={styles.profileRowLabel}>{label}</Text>
      <Text style={[styles.profileRowValue, multiline && { flex: 1 }]}>{value}</Text>
    </View>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 96, height: 96, borderRadius: borderRadius.full },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontFamily: fonts.heading, fontSize: 40, color: '#000' },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  avatarEditIcon: { fontSize: 14 },
  userInfo: { alignItems: 'center', marginTop: spacing.md },
  userName: { fontFamily: fonts.heading, fontSize: 28, color: colors.text, letterSpacing: 2 },
  userEmail: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  userSport: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.primary, marginTop: 4 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { fontFamily: fonts.heading, fontSize: 16, color: colors.textSecondary, letterSpacing: 2, marginBottom: spacing.md },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  profileRowLabel: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textSecondary },
  profileRowValue: { fontFamily: fonts.body, fontSize: 14, color: colors.text, maxWidth: '60%', textAlign: 'right' },
  editButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  editButtonText: { fontFamily: fonts.heading, fontSize: 18, color: '#000', letterSpacing: 2 },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemText: { fontFamily: fonts.body, fontSize: 15, color: colors.text },
  menuItemArrow: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  logoutButtonText: { fontFamily: fonts.heading, fontSize: 18, color: colors.error, letterSpacing: 2 },
  formField: { marginBottom: spacing.md },
  fieldLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.textSecondary, letterSpacing: 1, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  inputMultiline: { height: 100, textAlignVertical: 'top' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textSecondary },
  chipTextActive: { color: '#000' },
  editActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: { fontFamily: fonts.heading, fontSize: 16, color: colors.text, letterSpacing: 1 },
  saveButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontFamily: fonts.heading, fontSize: 16, color: '#000', letterSpacing: 2 },
});
