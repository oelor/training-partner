// API Client for Training Partner Cloudflare Worker
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://training-partner-app.oeler.workers.dev';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('tp_token');
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new ApiError(data.error || 'Request failed', res.status, data);
    }

    return data as T;
  }

  // Auth
  async register(data: { name: string; email: string; password: string; sport?: string }) {
    const res = await this.request<{ ok: boolean; token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) localStorage.setItem('tp_token', res.token);
    return res;
  }

  async login(data: { email: string; password: string }) {
    const res = await this.request<{ ok: boolean; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) localStorage.setItem('tp_token', res.token);
    return res;
  }

  async getMe() {
    return this.request<{ ok: boolean; user: User; profile: UserProfile | null; subscription: Subscription }>('/api/auth/me');
  }

  logout() {
    localStorage.removeItem('tp_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Profile
  async updateProfile(data: Partial<UserProfile & { display_name?: string; city?: string; avatar_url?: string }>) {
    return this.request<{ ok: boolean; profile_completeness: number }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getProfile(userId: number) {
    return this.request<{ ok: boolean; profile: PartnerProfile }>(`/api/profile/${userId}`);
  }

  // Partners
  async getPartners(params?: { sport?: string; skill?: string; search?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams();
    if (params?.sport) query.set('sport', params.sport);
    if (params?.skill) query.set('skill', params.skill);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    const qs = query.toString();
    return this.request<{ ok: boolean; partners: Partner[]; total: number }>(`/api/partners${qs ? '?' + qs : ''}`);
  }

  async getPartnerDetail(partnerId: number) {
    return this.request<{ ok: boolean; partner: PartnerDetail }>(`/api/partners/${partnerId}`);
  }

  // Gyms
  async getGyms(params?: { sport?: string; city?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.sport) query.set('sport', params.sport);
    if (params?.city) query.set('city', params.city);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return this.request<{ ok: boolean; gyms: Gym[]; total: number }>(`/api/gyms${qs ? '?' + qs : ''}`);
  }

  async getGymDetail(gymId: number) {
    return this.request<{ ok: boolean; gym: GymDetail }>(`/api/gyms/${gymId}`);
  }

  // Bookings
  async createBooking(sessionId: number) {
    return this.request<{ ok: boolean; message: string }>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  }

  async getBookings() {
    return this.request<{ ok: boolean; bookings: Booking[] }>('/api/bookings');
  }

  async cancelBooking(bookingId: number) {
    return this.request<{ ok: boolean }>(`/api/bookings/${bookingId}/cancel`, { method: 'POST' });
  }

  // Messages
  async getConversations() {
    return this.request<{ ok: boolean; conversations: Conversation[] }>('/api/messages');
  }

  async getMessages(userId: number, before?: string) {
    const query = before ? `?before=${before}` : '';
    return this.request<{ ok: boolean; messages: Message[] }>(`/api/messages/${userId}${query}`);
  }

  async sendMessage(userId: number, content: string) {
    return this.request<{ ok: boolean; message: Message }>(`/api/messages/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async getUnreadCount() {
    return this.request<{ ok: boolean; unread: number }>('/api/messages/unread');
  }

  // Subscriptions
  async getSubscriptionStatus() {
    return this.request<{ ok: boolean; subscription: Subscription }>('/api/subscriptions/status');
  }

  // Notifications
  async getNotifications() {
    return this.request<{ ok: boolean; notifications: Notification[]; unread_count: number }>('/api/notifications');
  }

  async markNotificationsRead() {
    return this.request<{ ok: boolean }>('/api/notifications/read', { method: 'POST' });
  }

  // Reviews
  async createReview(gymId: number, rating: number, comment?: string) {
    return this.request<{ ok: boolean }>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ gym_id: gymId, rating, comment }),
    });
  }

  // Block
  async blockUser(userId: number) {
    return this.request<{ ok: boolean }>('/api/block', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  // Legacy
  async submitFoundingApplication(data: Record<string, string>) {
    return this.request<{ ok: boolean }>('/api/founding/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitWaitlist(data: Record<string, string>) {
    return this.request<{ ok: boolean }>('/api/waitlist', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// Types
export interface User {
  id: number;
  email: string;
  display_name: string;
  role: string;
  city: string;
  avatar_url: string;
  email_verified?: number;
  created_at?: string;
}

export interface UserProfile {
  sports: string[];
  skill_level: string;
  weight_class: string;
  training_goals: string[];
  experience_years: number;
  bio: string;
  availability: Array<{ day: string; time: string }>;
  age: number;
  location: string;
  profile_complete: number;
}

export interface Partner {
  id: number;
  name: string;
  city: string;
  avatar_url: string;
  sport: string;
  sports: string[];
  skill: string;
  weight: string;
  goals: string[];
  experience: number;
  bio: string;
  location: string;
  match: number;
  explanation: Record<string, unknown>;
}

export interface PartnerDetail extends Partner {
  availability: Array<{ day: string; time: string }>;
  created_at: string;
}

export interface PartnerProfile {
  id: number;
  display_name: string;
  city: string;
  avatar_url: string;
  role: string;
  sports: string[];
  skill_level: string;
  weight_class: string;
  training_goals: string[];
  experience_years: number;
  bio: string;
  availability: Array<{ day: string; time: string }>;
  created_at: string;
}

export interface Gym {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  description: string;
  sports: string[];
  amenities: string[];
  verified: boolean;
  premium: boolean;
  rating: number;
  review_count: number;
  price: string;
}

export interface GymSession {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  max_slots: number;
  current_slots: number;
  available: number;
}

export interface GymReview {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface GymDetail extends Gym {
  sessions: GymSession[];
  reviews: GymReview[];
}

export interface Booking {
  id: number;
  gym_name: string;
  gym_city: string;
  day: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
}

export interface Conversation {
  user_id: number;
  name: string;
  avatar_url: string;
  last_message: string;
  last_message_at: string;
  is_mine: boolean;
  unread_count: number;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  read: boolean;
  created_at: string;
  is_mine: boolean;
}

export interface Subscription {
  plan: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  trial_ends_at?: string;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export const api = new ApiClient();
export default api;
