import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getPartner, sendMessage, reportUser, blockUser } from '../../lib/api';
import { colors, spacing, borderRadius, fonts } from '../../lib/theme';

interface Partner {
  id: string;
  name: string;
  sport?: string;
  skill_level?: string;
  weight_class?: string;
  city?: string;
  bio?: string;
  avatar_url?: string;
  match_score?: number;
  match_breakdown?: Record<string, number>;
  training_goals?: string;
  availability?: string;
  sports?: string[];
}

export default function PartnerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    if (id) loadPartner();
  }, [id]);

  async function loadPartner() {
    try {
      const data = await getPartner(id);
      setPartner(data.partner || data);
    } catch {
      Alert.alert('Error', 'Could not load partner profile');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleMessage() {
    setMessaging(true);
    try {
      await sendMessage(id, 'Hey! I saw your profile and would love to train together.');
      router.push(`/chat/${id}`);
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not send message');
    } finally {
      setMessaging(false);
    }
  }

  function handleReport() {
    Alert.alert('Report User', 'Why are you reporting this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Spam',
        onPress: () => reportUser(id, 'spam').then(() => Alert.alert('Reported', 'Thank you for your report')),
      },
      {
        text: 'Inappropriate',
        onPress: () => reportUser(id, 'inappropriate').then(() => Alert.alert('Reported', 'Thank you for your report')),
      },
    ]);
  }

  function handleBlock() {
    Alert.alert('Block User', 'Block this user? They won\'t be able to contact you.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: () => blockUser(id).then(() => { Alert.alert('Blocked', 'User blocked'); router.back(); }),
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!partner) return null;

  const score = partner.match_score || 0;
  const scoreColor = score >= 80 ? colors.accent : score >= 60 ? colors.warning : colors.textSecondary;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        {partner.avatar_url ? (
          <Image source={{ uri: partner.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{partner.name?.[0]?.toUpperCase() || '?'}</Text>
          </View>
        )}

        <Text style={styles.name}>{partner.name}</Text>
        {partner.city && <Text style={styles.city}>📍 {partner.city}</Text>}

        {score > 0 && (
          <View style={styles.scoreContainer}>
            <Text style={[styles.score, { color: scoreColor }]}>{score}%</Text>
            <Text style={styles.scoreLabel}>MATCH SCORE</Text>
          </View>
        )}
      </View>

      {/* Tags */}
      <View style={styles.tagsRow}>
        {partner.sport && <Tag label={partner.sport} color={colors.primary} />}
        {partner.skill_level && <Tag label={partner.skill_level} color={colors.accent} />}
        {partner.weight_class && <Tag label={partner.weight_class} />}
      </View>

      {/* Bio */}
      {partner.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <Text style={styles.bioText}>{partner.bio}</Text>
        </View>
      )}

      {/* Training Goals */}
      {partner.training_goals && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRAINING GOALS</Text>
          <Text style={styles.bioText}>{partner.training_goals}</Text>
        </View>
      )}

      {/* Match Breakdown */}
      {partner.match_breakdown && Object.keys(partner.match_breakdown).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MATCH BREAKDOWN</Text>
          {Object.entries(partner.match_breakdown).map(([key, val]) => (
            <View key={key} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{key.replace(/_/g, ' ').toUpperCase()}</Text>
              <View style={styles.breakdownBar}>
                <View style={[styles.breakdownFill, { width: `${val}%`, backgroundColor: val >= 80 ? colors.accent : val >= 60 ? colors.warning : colors.primary }]} />
              </View>
              <Text style={styles.breakdownValue}>{val}%</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <TouchableOpacity
        style={[styles.messageButton, messaging && styles.buttonDisabled]}
        onPress={handleMessage}
        disabled={messaging}
      >
        {messaging ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.messageButtonText}>💬 SEND MESSAGE</Text>
        )}
      </TouchableOpacity>

      {/* Safety */}
      <View style={styles.safetyRow}>
        <TouchableOpacity style={styles.safetyButton} onPress={handleReport}>
          <Text style={styles.safetyButtonText}>Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.safetyButton} onPress={handleBlock}>
          <Text style={[styles.safetyButtonText, { color: colors.error }]}>Block</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Tag({ label, color }: { label: string; color?: string }) {
  return (
    <View style={[styles.tag, { borderColor: color || colors.border }]}>
      <Text style={[styles.tagText, { color: color || colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  loadingContainer: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: { width: 100, height: 100, borderRadius: borderRadius.full, marginBottom: spacing.md },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarInitial: { fontFamily: fonts.heading, fontSize: 42, color: '#000' },
  name: { fontFamily: fonts.heading, fontSize: 32, color: colors.text, letterSpacing: 2, marginBottom: spacing.xs },
  city: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.md },
  scoreContainer: { alignItems: 'center' },
  score: { fontFamily: fonts.heading, fontSize: 48, letterSpacing: 2 },
  scoreLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary, letterSpacing: 2 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg, justifyContent: 'center' },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  tagText: { fontFamily: fonts.bodyMedium, fontSize: 13 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { fontFamily: fonts.heading, fontSize: 14, color: colors.textSecondary, letterSpacing: 2, marginBottom: spacing.sm },
  bioText: { fontFamily: fonts.body, fontSize: 15, color: colors.text, lineHeight: 22 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  breakdownLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary, width: 100 },
  breakdownBar: { flex: 1, height: 6, backgroundColor: colors.border, borderRadius: borderRadius.full, marginHorizontal: spacing.sm },
  breakdownFill: { height: 6, borderRadius: borderRadius.full },
  breakdownValue: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.text, width: 36, textAlign: 'right' },
  messageButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buttonDisabled: { opacity: 0.6 },
  messageButtonText: { fontFamily: fonts.heading, fontSize: 18, color: '#000', letterSpacing: 2 },
  safetyRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xl },
  safetyButton: { padding: spacing.sm },
  safetyButtonText: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
});
