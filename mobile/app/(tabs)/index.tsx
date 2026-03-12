import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { getPartners, getConversations, getBookings, getUnreadCount } from '../../lib/api';
import { colors, spacing, borderRadius, fonts } from '../../lib/theme';
import PartnerCard from '../../components/PartnerCard';

interface Stats {
  matches: number;
  messages: number;
  bookings: number;
  unread: number;
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const [partners, setPartners] = useState<unknown[]>([]);
  const [stats, setStats] = useState<Stats>({ matches: 0, messages: 0, bookings: 0, unread: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [partnersData, conversationsData, bookingsData, unreadData] = await Promise.allSettled([
        getPartners({ limit: 3 }),
        getConversations(),
        getBookings(),
        getUnreadCount(),
      ]);

      if (partnersData.status === 'fulfilled') {
        const p = partnersData.value;
        setPartners(Array.isArray(p) ? p.slice(0, 3) : (p.partners || []).slice(0, 3));
      }
      const convCount = conversationsData.status === 'fulfilled'
        ? (Array.isArray(conversationsData.value) ? conversationsData.value.length : 0) : 0;
      const bookCount = bookingsData.status === 'fulfilled'
        ? (Array.isArray(bookingsData.value) ? bookingsData.value.length : 0) : 0;
      const unread = unreadData.status === 'fulfilled'
        ? (unreadData.value.count || 0) : 0;

      setStats({
        matches: partnersData.status === 'fulfilled'
          ? (Array.isArray(partnersData.value) ? partnersData.value.length : (partnersData.value.total || 0)) : 0,
        messages: convCount,
        bookings: bookCount,
        unread,
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const profileComplete = user ? calculateProfileComplete(user) : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>WELCOME BACK,</Text>
        <Text style={styles.name}>{user?.name?.toUpperCase() || 'FIGHTER'}</Text>
        <Text style={styles.sport}>{user?.sport || 'Set your sport in profile'}</Text>
      </View>

      {/* Profile Completion */}
      {profileComplete < 100 && (
        <TouchableOpacity
          style={styles.completionCard}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <View style={styles.completionHeader}>
            <Text style={styles.completionTitle}>COMPLETE YOUR PROFILE</Text>
            <Text style={styles.completionPercent}>{profileComplete}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${profileComplete}%` }]} />
          </View>
          <Text style={styles.completionHint}>Tap to complete → get better matches</Text>
        </TouchableOpacity>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard label="MATCHES" value={stats.matches} color={colors.primary} />
        <StatCard label="MESSAGES" value={stats.messages} badge={stats.unread} color={colors.accent} />
        <StatCard label="BOOKINGS" value={stats.bookings} color={colors.warning} />
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
      <View style={styles.actionsGrid}>
        <ActionButton icon="🥊" label="Find Partners" onPress={() => router.push('/(tabs)/partners')} />
        <ActionButton icon="🏋️" label="Find Gyms" onPress={() => router.push('/(tabs)/gyms')} />
        <ActionButton icon="💬" label="Messages" onPress={() => router.push('/(tabs)/messages')} />
        <ActionButton icon="📢" label="Community" onPress={() => router.push('/community')} />
        <ActionButton icon="🔔" label="Notifications" onPress={() => router.push('/notifications')} />
        <ActionButton icon="⚙️" label="Settings" onPress={() => router.push('/settings')} />
      </View>

      {/* Recent Partners */}
      {partners.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT MATCHES</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/partners')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          {partners.map((partner: unknown) => (
            <PartnerCard
              key={(partner as { id: string }).id}
              partner={partner as { id: string; name: string; sport?: string; skill_level?: string; city?: string; avatar_url?: string; match_score?: number }}
              onPress={() => router.push(`/partner/${(partner as { id: string }).id}`)}
            />
          ))}
        </>
      )}
    </ScrollView>
  );
}

function StatCard({ label, value, color, badge }: { label: string; value: number; color: string; badge?: number }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {badge ? <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View> : null}
    </View>
  );
}

function ActionButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function calculateProfileComplete(user: { sport?: string; skill_level?: string; city?: string; bio?: string; weight_class?: string }): number {
  const fields = ['sport', 'skill_level', 'city', 'bio', 'weight_class'];
  const filled = fields.filter((f) => !!(user as Record<string, unknown>)[f]).length;
  return Math.round((filled / fields.length) * 100);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  loadingContainer: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  header: { marginBottom: spacing.lg },
  greeting: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, letterSpacing: 1 },
  name: { fontFamily: fonts.heading, fontSize: 36, color: colors.text, letterSpacing: 2 },
  sport: { fontFamily: fonts.body, fontSize: 14, color: colors.primary, marginTop: spacing.xs },
  completionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  completionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  completionTitle: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.text, letterSpacing: 1 },
  completionPercent: { fontFamily: fonts.heading, fontSize: 18, color: colors.accent },
  progressBar: { height: 4, backgroundColor: colors.border, borderRadius: borderRadius.full, marginBottom: spacing.sm },
  progressFill: { height: 4, backgroundColor: colors.accent, borderRadius: borderRadius.full },
  completionHint: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderTopWidth: 3,
    alignItems: 'center',
  },
  statValue: { fontFamily: fonts.heading, fontSize: 28, letterSpacing: 1 },
  statLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.textSecondary, letterSpacing: 1, marginTop: 2 },
  badge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 10, color: '#fff' },
  sectionTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.text, letterSpacing: 2, marginBottom: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  seeAll: { fontFamily: fonts.body, fontSize: 13, color: colors.primary },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  actionButton: {
    width: '30%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: { fontSize: 24, marginBottom: spacing.xs },
  actionLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary, textAlign: 'center' },
});
