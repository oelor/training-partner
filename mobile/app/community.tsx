import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { getPosts, createPost, likePost } from '../lib/api';
import { useAuth } from '../lib/auth';
import { colors, spacing, borderRadius, fonts } from '../lib/theme';

const SPORTS = ['All', 'BJJ', 'MMA', 'Boxing', 'Muay Thai', 'Wrestling', 'Judo'];
const POST_TYPES = ['All', 'tip', 'question', 'highlight', 'event'];

interface Post {
  id: string;
  title: string;
  body?: string;
  type?: string;
  sport?: string;
  author_name?: string;
  likes_count?: number;
  created_at?: string;
  liked_by_me?: boolean;
}

export default function CommunityScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sport, setSport] = useState('All');
  const [type, setType] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newType, setNewType] = useState('tip');
  const [newSport, setNewSport] = useState(user?.sport || 'BJJ');
  const [creating, setCreating] = useState(false);

  const loadPosts = useCallback(async () => {
    try {
      const data = await getPosts({
        sport: sport !== 'All' ? sport : undefined,
        type: type !== 'All' ? type : undefined,
      });
      setPosts(Array.isArray(data) ? data : (data.posts || []));
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sport, type]);

  useEffect(() => {
    setLoading(true);
    loadPosts();
  }, [sport, type]); // eslint-disable-line react-hooks/exhaustive-deps

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPosts();
  }, [loadPosts]);

  async function handleLike(postId: string) {
    try {
      await likePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, liked_by_me: !p.liked_by_me, likes_count: (p.likes_count || 0) + (p.liked_by_me ? -1 : 1) }
            : p
        )
      );
    } catch {
      // ignore
    }
  }

  async function handleCreate() {
    if (!newTitle.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    setCreating(true);
    try {
      await createPost({ title: newTitle.trim(), body: newBody.trim(), type: newType, sport: newSport });
      setShowCreate(false);
      setNewTitle('');
      setNewBody('');
      loadPosts();
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setCreating(false);
    }
  }

  function formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  }

  return (
    <View style={styles.container}>
      {/* Filters */}
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
            <Text style={[styles.filterChipText, sport === item && styles.filterChipTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Posts */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              <View style={styles.postHeader}>
                {item.type && (
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
                  </View>
                )}
                {item.sport && (
                  <View style={[styles.typeBadge, { backgroundColor: colors.primary + '22' }]}>
                    <Text style={[styles.typeBadgeText, { color: colors.primary }]}>{item.sport}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.postTitle}>{item.title}</Text>
              {item.body ? <Text style={styles.postBody} numberOfLines={3}>{item.body}</Text> : null}
              <View style={styles.postFooter}>
                <Text style={styles.postAuthor}>by {item.author_name || 'Anonymous'}</Text>
                <Text style={styles.postDate}>{formatDate(item.created_at)}</Text>
                <TouchableOpacity style={styles.likeButton} onPress={() => handleLike(item.id)}>
                  <Text style={[styles.likeText, item.liked_by_me && styles.likeTextActive]}>
                    {item.liked_by_me ? '❤️' : '🤍'} {item.likes_count || 0}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📢</Text>
              <Text style={styles.emptyTitle}>NO POSTS YET</Text>
              <Text style={styles.emptyText}>Be the first to post in the community</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Create Post Modal */}
      <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreate(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>NEW POST</Text>
            <TouchableOpacity onPress={handleCreate} disabled={creating}>
              {creating ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.modalPost}>Post</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.modalInput}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Title"
              placeholderTextColor={colors.textSecondary}
              maxLength={100}
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={newBody}
              onChangeText={setNewBody}
              placeholder="Share your knowledge, ask a question, or post a highlight..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              maxLength={2000}
            />

            <Text style={styles.modalLabel}>TYPE</Text>
            <View style={styles.chipRow}>
              {['tip', 'question', 'highlight', 'event'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, newType === t && styles.chipActive]}
                  onPress={() => setNewType(t)}
                >
                  <Text style={[styles.chipText, newType === t && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>SPORT</Text>
            <View style={styles.chipRow}>
              {SPORTS.filter((s) => s !== 'All').map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, newSport === s && styles.chipActive]}
                  onPress={() => setNewSport(s)}
                >
                  <Text style={[styles.chipText, newSport === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  listContent: { padding: spacing.md },
  postCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  postHeader: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm },
  typeBadge: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  typeBadgeText: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.textSecondary, letterSpacing: 1 },
  postTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.text, marginBottom: spacing.xs },
  postBody: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.sm },
  postFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  postAuthor: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, flex: 1 },
  postDate: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  likeButton: { padding: spacing.xs },
  likeText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textSecondary },
  likeTextActive: { color: colors.error },
  emptyContainer: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, letterSpacing: 2, marginBottom: spacing.sm },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { fontFamily: fonts.heading, fontSize: 28, color: '#000' },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCancel: { fontFamily: fonts.body, fontSize: 16, color: colors.textSecondary },
  modalTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.text, letterSpacing: 2 },
  modalPost: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.primary },
  modalContent: { padding: spacing.lg },
  modalInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 15,
    marginBottom: spacing.md,
  },
  modalTextArea: { height: 120, textAlignVertical: 'top' },
  modalLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.textSecondary, letterSpacing: 1, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textSecondary },
  chipTextActive: { color: '#000' },
});
