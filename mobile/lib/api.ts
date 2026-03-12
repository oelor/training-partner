import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://training-partner-app.elor-orry.workers.dev';
const TOKEN_KEY = 'training_partner_token';

// Token management
export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// Base fetch with auth
async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(`${API_URL}${path}`, { ...options, headers });
}

// Auth
export async function login(email: string, password: string) {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  if (data.token) await setToken(data.token);
  return data;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  sport: string;
}) {
  const res = await apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ ...payload, turnstile_token: 'mobile-bypass' }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  if (data.token) await setToken(data.token);
  return data;
}

export async function forgotPassword(email: string) {
  const res = await apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function getMe() {
  const res = await apiFetch('/api/auth/me');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Not authenticated');
  return data.user || data;
}

export async function logout() {
  await removeToken();
}

// Profile
export async function updateProfile(payload: Record<string, unknown>) {
  const res = await apiFetch('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Update failed');
  return data;
}

export async function getProfile(id: string) {
  const res = await apiFetch(`/api/profile/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Not found');
  return data;
}

export async function uploadAvatar(base64Data: string) {
  const res = await apiFetch('/api/upload-avatar', {
    method: 'POST',
    body: JSON.stringify({ avatar_data: base64Data }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

// Partners
export async function getPartners(params?: {
  sport?: string;
  skill_level?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const query = new URLSearchParams();
  if (params?.sport) query.set('sport', params.sport);
  if (params?.skill_level) query.set('skill_level', params.skill_level);
  if (params?.search) query.set('search', params.search);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.offset) query.set('offset', String(params.offset));
  const res = await apiFetch(`/api/partners?${query.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load partners');
  return data;
}

export async function getPartner(id: string) {
  const res = await apiFetch(`/api/partners/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Not found');
  return data;
}

// Gyms
export async function getGyms(params?: {
  sport?: string;
  city?: string;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params?.sport) query.set('sport', params.sport);
  if (params?.city) query.set('city', params.city);
  if (params?.search) query.set('search', params.search);
  const res = await apiFetch(`/api/gyms?${query.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load gyms');
  return data;
}

export async function getGym(id: string) {
  const res = await apiFetch(`/api/gyms/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Not found');
  return data;
}

// Bookings
export async function createBooking(sessionId: string) {
  const res = await apiFetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Booking failed');
  return data;
}

export async function getBookings() {
  const res = await apiFetch('/api/bookings');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load bookings');
  return data;
}

export async function cancelBooking(id: string) {
  const res = await apiFetch(`/api/bookings/${id}/cancel`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Cancel failed');
  return data;
}

// Messages
export async function getConversations() {
  const res = await apiFetch('/api/messages');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load messages');
  return data;
}

export async function getMessages(userId: string) {
  const res = await apiFetch(`/api/messages/${userId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load messages');
  return data;
}

export async function sendMessage(userId: string, content: string) {
  const res = await apiFetch(`/api/messages/${userId}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Send failed');
  return data;
}

export async function getUnreadCount() {
  const res = await apiFetch('/api/messages/unread');
  const data = await res.json();
  if (!res.ok) return { count: 0 };
  return data;
}

// Notifications
export async function getNotifications() {
  const res = await apiFetch('/api/notifications');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load notifications');
  return data;
}

export async function markNotificationsRead() {
  const res = await apiFetch('/api/notifications/read', { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data;
}

// Posts
export async function getPosts(params?: {
  type?: string;
  sport?: string;
  sort?: string;
}) {
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.sport) query.set('sport', params.sport);
  if (params?.sort) query.set('sort', params.sort);
  const res = await apiFetch(`/api/posts?${query.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load posts');
  return data;
}

export async function createPost(payload: {
  title: string;
  body: string;
  type: string;
  sport: string;
}) {
  const res = await apiFetch('/api/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create post');
  return data;
}

export async function likePost(id: string) {
  const res = await apiFetch(`/api/posts/${id}/like`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data;
}

// Subscriptions
export async function getSubscriptionStatus() {
  const res = await apiFetch('/api/subscriptions/status');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data;
}

export async function createCheckout(plan: string) {
  const res = await apiFetch('/api/checkout/create', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data;
}

// Safety
export async function reportUser(reportedId: string, reason: string, details?: string) {
  const res = await apiFetch('/api/report', {
    method: 'POST',
    body: JSON.stringify({ reported_id: reportedId, reason, details }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data;
}

export async function blockUser(blockedId: string) {
  const res = await apiFetch('/api/block', {
    method: 'POST',
    body: JSON.stringify({ blocked_id: blockedId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data;
}

export async function deleteAccount() {
  const res = await apiFetch('/api/account/delete', {
    method: 'POST',
    body: JSON.stringify({ confirmation: 'DELETE' }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data;
}
