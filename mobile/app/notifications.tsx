import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { getNotifications, markNotificationsRead } from '../lib/api';
import { colors, spacing, borderRadius, fonts } from '../lib/theme';

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at?: string;
}

const NOTIFICATION_ICONS: Record<string, string> = {
  match: '🥊',
  message: '💬',
  booking: '📅',
  system: '🔔',
  like: '❤️',
  default: '🔔',
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      const list: Notification[] = Array.isArray(data) ? data : (data.notifications || []);
      setNotifications(list);
      // Mark all as read
      if (list.some((n) => !n.read)) {
        await markNotificationsRead();
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications();
  }, [loadNotifications]);

  function formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  }

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
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <View style={[styles.notifItem, !item.read && styles.notifItemUnread]}>
            <Text style={styles.notifIcon}>
              {NOTIFICATION_ICONS[item.type] || NOTIFICATION_ICONS.default}
            </Text>
            <View style={styles.notifContent}>
              <Text style={[styles.notifMessage, !item.read && styles.notifMessageUnread]}>
                {item.message}
              </Text>
              <Text style={styles.notifTime}>{formatDate(item.created_at)}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>ALL CAUGHT UP</Text>
            <Text style={styles.emptyText}>No new notifications</Text>
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
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  notifItemUnread: { backgroundColor: colors.surface },
  notifIcon: { fontSize: 24, marginRight: spacing.md },
  notifContent: { flex: 1 },
  notifMessage: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary, lineHeight: 20 },
  notifMessageUnread: { color: colors.text, fontFamily: fonts.bodyMedium },
  notifTime: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
  },
  emptyContainer: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, letterSpacing: 2, marginBottom: spacing.sm },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
});
