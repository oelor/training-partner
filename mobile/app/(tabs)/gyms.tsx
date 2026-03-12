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
import { getGyms } from '../../lib/api';
import { colors, spacing, borderRadius, fonts } from '../../lib/theme';
import GymCard from '../../components/GymCard';

const SPORTS = ['All', 'BJJ', 'MMA', 'Boxing', 'Muay Thai', 'Wrestling', 'Judo', 'Kickboxing'];

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

export default function GymsScreen() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('All');
  const [city, setCity] = useState('');

  const loadGyms = useCallback(async () => {
    try {
      const data = await getGyms({
        search: search || undefined,
        sport: sport !== 'All' ? sport : undefined,
        city: city || undefined,
      });
      setGyms(Array.isArray(data) ? data : (data.gyms || []));
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, sport, city]);

  useEffect(() => {
    setLoading(true);
    loadGyms();
  }, [search, sport, city]); // eslint-disable-line react-hooks/exhaustive-deps

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadGyms();
  }, [loadGyms]);

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.searchInput, { flex: 2 }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Search gyms..."
          placeholderTextColor={colors.textSecondary}
        />
        <TextInput
          style={[styles.searchInput, { flex: 1, marginLeft: spacing.sm }]}
          value={city}
          onChangeText={setCity}
          placeholder="City"
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={gyms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <GymCard
              gym={item}
              onPress={() => router.push(`/gym/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏋️</Text>
              <Text style={styles.emptyTitle}>NO GYMS FOUND</Text>
              <Text style={styles.emptyText}>Try a different city or sport filter</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchRow: { flexDirection: 'row', padding: spacing.md, paddingBottom: 0 },
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
  filterChipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textSecondary },
  filterChipTextActive: { color: '#000' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: spacing.md, paddingTop: spacing.sm },
  emptyContainer: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, letterSpacing: 2, marginBottom: spacing.sm },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
});
