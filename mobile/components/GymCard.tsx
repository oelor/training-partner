import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors, spacing, borderRadius, fonts } from '../lib/theme';

interface Gym {
  id: string;
  name: string;
  city?: string;
  sports?: string | string[];
  rating?: number;
  photo_url?: string;
  description?: string;
  monthly_fee?: number;
}

interface Props {
  gym: Gym;
  onPress: () => void;
}

export default function GymCard({ gym, onPress }: Props) {
  const sports = typeof gym.sports === 'string'
    ? gym.sports.split(',').map((s) => s.trim())
    : (gym.sports || []);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {gym.photo_url ? (
        <Image source={{ uri: gym.photo_url }} style={styles.photo} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoIcon}>🏋️</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{gym.name}</Text>
        {gym.city && <Text style={styles.city}>📍 {gym.city}</Text>}

        <View style={styles.sportsRow}>
          {sports.slice(0, 3).map((sport) => (
            <View key={sport} style={styles.sportTag}>
              <Text style={styles.sportTagText}>{sport}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          {gym.rating ? (
            <Text style={styles.rating}>⭐ {gym.rating.toFixed(1)}</Text>
          ) : null}
          {gym.monthly_fee ? (
            <Text style={styles.fee}>${gym.monthly_fee}/mo</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 140,
  },
  photoPlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIcon: { fontSize: 48 },
  info: { padding: spacing.md },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  city: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  sportsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sportTag: {
    backgroundColor: colors.primary + '22',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  sportTagText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rating: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.warning,
  },
  fee: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.accent,
  },
});
