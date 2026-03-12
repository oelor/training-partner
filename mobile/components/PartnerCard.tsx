import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors, spacing, borderRadius, fonts } from '../lib/theme';

interface Partner {
  id: string;
  name: string;
  sport?: string;
  skill_level?: string;
  city?: string;
  avatar_url?: string;
  match_score?: number;
}

interface Props {
  partner: Partner;
  onPress: () => void;
}

export default function PartnerCard({ partner, onPress }: Props) {
  const score = partner.match_score || 0;
  const scoreColor = score >= 80 ? colors.accent : score >= 60 ? colors.warning : colors.textSecondary;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.avatarContainer}>
        {partner.avatar_url ? (
          <Image source={{ uri: partner.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{partner.name?.[0]?.toUpperCase() || '?'}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{partner.name}</Text>
        <View style={styles.tags}>
          {partner.sport && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{partner.sport}</Text>
            </View>
          )}
          {partner.skill_level && (
            <View style={[styles.tag, styles.tagSecondary]}>
              <Text style={styles.tagText}>{partner.skill_level}</Text>
            </View>
          )}
        </View>
        {partner.city && (
          <Text style={styles.location}>📍 {partner.city}</Text>
        )}
      </View>

      {score > 0 && (
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, { color: scoreColor }]}>{score}%</Text>
          <Text style={styles.scoreLabel}>MATCH</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: '#000',
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  tag: {
    backgroundColor: colors.primary + '22',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagSecondary: {
    backgroundColor: colors.surfaceLight,
  },
  tagText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  location: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  scoreContainer: {
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  score: {
    fontFamily: fonts.heading,
    fontSize: 22,
    letterSpacing: 1,
  },
  scoreLabel: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
});
