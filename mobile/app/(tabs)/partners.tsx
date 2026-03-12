import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { getPartners } from '../../lib/api';
import { colors, spacing, borderRadius, fonts } from '../../lib/theme';
import PartnerCard from '../../components/PartnerCard';

const SPORTS = ['All', 'BJJ', 'MMA', 'Boxing', 'Muay Thai', 'Wrestling', 'Judo', 'Kickboxing'];
const SKILL_LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Elite'];

interface Partner {
  id: string;
  name: string;
  sport?: string;
  skill_level?: string;
  city?: string;
  avatar_url?: string;
  match_score?: number;
}

export default function PartnersScreen() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('All');
  const [skillLevel, setSkillLevel] = useState('All');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadPartners = useCallback(async (reset = false) => {
    try {
      const offset = reset ? 0 : page * 20;
      const data = await getPartners({
        search: search || undefined,
        sport: sport !== 'All' ? sport : undefined,
        skill_level: skillLevel !== 'All' ? skillLevel : undefined,
        limit: 20,
        offset,
      });
      const list: Partner[] = Array.isArray(data) ? data : (data.partners || []);
      if (reset) {
        setPartners(list);
        setPage(1);
      } else {
        setPartners((prev) => [...prev, ...list]);
        setPage((p) => p + 1);
      }
      setHasMore(list.length === 20);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, sport, skillLevel, page]);

  useEffect(() => {
    setLoading(true);
    loadPartners(true);
  }, [search, sport, skillLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPartners(true);
  }, [loadPartners]);

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search partners..."
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Sport Filter */}
      <FlatList
        horizontal
        data={SPORTS}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, sport === item && styles.filterChipActive]}
            onPress={() => setSport(item)}
          >
            <Text style={[styles.filterChipText, sport === item && styles.filterChipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Skill Level Filter */}
      <FlatList
        horizontal
        data={SKILL_LEVELS}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, skillLevel === item && styles.filterChipActiveSecondary]}
            onPress={() => setSkillLevel(item)}
          >
            <Text style={[styles.filterChipText, skillLevel === item && styles.filterChipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Partners List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={partners}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <PartnerCard
              partner={item}
              onPress={() => router.push(`/partner/${item.id}`)}
            />
          )}
          onEndReached={() => hasMore && loadPartners()}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🥊</Text>
              <Text style={styles.emptyTitle}>NO PARTNERS FOUND</Text>
              <Text style={styles.emptyText}>Try adjusting your filters or complete your profile to get better matches</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchContainer: { padding: spacing.md, paddingBottom: 0 },
  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  filterRow: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipActiveSecondary: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterChipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textSecondary },
  filterChipTextActive: { color: '#000' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: spacing.md, paddingTop: spacing.sm },
  emptyContainer: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, letterSpacing: 2, marginBottom: spacing.sm },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
