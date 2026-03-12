import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { getConversations } from '../../lib/api';
import { colors, spacing, borderRadius, fonts } from '../../lib/theme';

interface Conversation {
  id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
}

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(Array.isArray(data) ? data : (data.conversations || []));
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations();
  }, [loadConversations]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id || item.other_user_id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => router.push(`/chat/${item.other_user_id}`)}
            activeOpacity={0.8}
          >
            <View style={styles.avatarContainer}>
              {item.other_user_avatar ? (
                <Image source={{ uri: item.other_user_avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {item.other_user_name?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
              )}
              {(item.unread_count || 0) > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{item.unread_count}</Text>
                </View>
              )}
            </View>

            <View style={styles.conversationInfo}>
              <View style={styles.conversationHeader}>
                <Text style={[styles.userName, (item.unread_count || 0) > 0 && styles.userNameBold]}>
                  {item.other_user_name}
                </Text>
                <Text style={styles.time}>{formatTime(item.last_message_at)}</Text>
              </View>
              <Text
                style={[styles.lastMessage, (item.unread_count || 0) > 0 && styles.lastMessageBold]}
                numberOfLines={1}
              >
                {item.last_message || 'Start a conversation'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>NO MESSAGES YET</Text>
            <Text style={styles.emptyText}>
              Find a training partner and send them a message to get started
            </Text>
            <TouchableOpacity
              style={styles.findButton}
              onPress={() => router.push('/(tabs)/partners')}
            >
              <Text style={styles.findButtonText}>FIND PARTNERS</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingVertical: spacing.sm },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: { position: 'relative', marginRight: spacing.md },
  avatar: { width: 52, height: 52, borderRadius: borderRadius.full },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontFamily: fonts.heading, fontSize: 22, color: '#000' },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadBadgeText: { fontFamily: fonts.bodyBold, fontSize: 10, color: '#000' },
  conversationInfo: { flex: 1 },
  conversationHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  userName: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.text },
  userNameBold: { fontFamily: fonts.bodyBold, color: colors.text },
  time: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  lastMessage: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  lastMessageBold: { fontFamily: fonts.bodyMedium, color: colors.text },
  emptyContainer: { alignItems: 'center', paddingTop: spacing.xxl, padding: spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, letterSpacing: 2, marginBottom: spacing.sm },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  findButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  findButtonText: { fontFamily: fonts.heading, fontSize: 16, color: '#000', letterSpacing: 2 },
});
