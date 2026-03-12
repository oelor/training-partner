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
import { getGym, createBooking } from '../../lib/api';
import { colors, spacing, borderRadius, fonts } from '../../lib/theme';

interface Session {
  id: string;
  title: string;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  sport?: string;
  skill_level?: string;
  max_participants?: number;
  price?: number;
}

interface Gym {
  id: string;
  name: string;
  city?: string;
  address?: string;
  sports?: string | string[];
  rating?: number;
  photo_url?: string;
  description?: string;
  monthly_fee?: number;
  website?: string;
  phone?: string;
  sessions?: Session[];
}

export default function GymDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadGym();
  }, [id]);

  async function loadGym() {
    try {
      const data = await getGym(id);
      setGym(data.gym || data);
    } catch {
      Alert.alert('Error', 'Could not load gym');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleBook(sessionId: string) {
    setBookingId(sessionId);
    try {
      await createBooking(sessionId);
      Alert.alert('Booked!', 'Your session has been booked successfully.');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setBookingId(null);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!gym) return null;

  const sports = typeof gym.sports === 'string'
    ? gym.sports.split(',').map((s) => s.trim())
    : (gym.sports || []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Photo */}
      {gym.photo_url ? (
        <Image source={{ uri: gym.photo_url }} style={styles.photo} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoIcon}>🏋️</Text>
        </View>
      )}

      {/* Info */}
      <View style={styles.infoSection}>
        <Text style={styles.name}>{gym.name}</Text>
        {gym.city && <Text style={styles.city}>📍 {gym.address || gym.city}</Text>}

        <View style={styles.statsRow}>
          {gym.rating ? (
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeText}>⭐ {gym.rating.toFixed(1)}</Text>
            </View>
          ) : null}
          {gym.monthly_fee ? (
            <View style={[styles.statBadge, { borderColor: colors.accent }]}>
              <Text style={[styles.statBadgeText, { color: colors.accent }]}>${gym.monthly_fee}/mo</Text>
            </View>
          ) : null}
        </View>

        {/* Sports */}
        {sports.length > 0 && (
          <View style={styles.sportsRow}>
            {sports.map((sport) => (
              <View key={sport} style={styles.sportTag}>
                <Text style={styles.sportTagText}>{sport}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Description */}
      {gym.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <Text style={styles.descText}>{gym.description}</Text>
        </View>
      )}

      {/* Contact */}
      {(gym.phone || gym.website) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTACT</Text>
          {gym.phone && <Text style={styles.contactText}>📞 {gym.phone}</Text>}
          {gym.website && <Text style={styles.contactText}>🌐 {gym.website}</Text>}
        </View>
      )}

      {/* Sessions */}
      {gym.sessions && gym.sessions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OPEN MAT SESSIONS</Text>
          {gym.sessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>{session.title}</Text>
                <Text style={styles.sessionDetails}>
                  {session.day_of_week} • {session.start_time} - {session.end_time}
                </Text>
                {session.sport && (
                  <Text style={styles.sessionSport}>{session.sport} • {session.skill_level}</Text>
                )}
                {session.price ? (
                  <Text style={styles.sessionPrice}>${session.price}</Text>
                ) : null}
              </View>
              <TouchableOpacity
                style={[styles.bookButton, bookingId === session.id && styles.bookButtonDisabled]}
                onPress={() => handleBook(session.id)}
                disabled={bookingId === session.id}
              >
                {bookingId === session.id ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.bookButtonText}>BOOK</Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  loadingContainer: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: 200 },
  photoPlaceholder: { width: '100%', height: 200, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  photoIcon: { fontSize: 64 },
  infoSection: { padding: spacing.lg },
  name: { fontFamily: fonts.heading, fontSize: 28, color: colors.text, letterSpacing: 2, marginBottom: spacing.xs },
  city: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statBadge: {
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statBadgeText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.warning },
  sportsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  sportTag: {
    backgroundColor: colors.primary + '22',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  sportTagText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.primary },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { fontFamily: fonts.heading, fontSize: 14, color: colors.textSecondary, letterSpacing: 2, marginBottom: spacing.md },
  descText: { fontFamily: fonts.body, fontSize: 15, color: colors.text, lineHeight: 22 },
  contactText: { fontFamily: fonts.body, fontSize: 14, color: colors.text, marginBottom: spacing.sm },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sessionInfo: { flex: 1 },
  sessionTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  sessionDetails: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  sessionSport: { fontFamily: fonts.body, fontSize: 12, color: colors.primary, marginTop: 2 },
  sessionPrice: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.accent, marginTop: 2 },
  bookButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginLeft: spacing.sm,
  },
  bookButtonDisabled: { opacity: 0.6 },
  bookButtonText: { fontFamily: fonts.heading, fontSize: 14, color: '#000', letterSpacing: 1 },
});
