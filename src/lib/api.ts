// API Client for Training Partner Cloudflare Worker
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://trainingpartner.app';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

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

    let lastError: Error | undefined;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await fetch(`${this.baseUrl}${path}`, {
          ...options,
          headers,
        });

        let data: Record<string, unknown>;
        try {
          data = await res.json();
        } catch {
          throw new ApiError('Server returned an invalid response', res.status, {});
        }

        if (!res.ok) {
          const errorMessage = this.formatErrorMessage(data, res.status);
          throw new ApiError(errorMessage, res.status, data);
        }

        return data as T;
      } catch (error) {
        const fetchError = error as Error;
        // Retry on network errors only
        if (fetchError.message.includes('network') && attempt < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (attempt + 1)));
          lastError = fetchError;
          continue;
        }
        throw error;
      }
    }
    throw lastError || new ApiError('Request failed after multiple attempts', 0);
  }

  private formatErrorMessage(data: Record<string, unknown>, status: number): string {
    const errorData = data?.error as string || data?.message as string || 'Request failed';
    switch (status) {
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 422:
        return errorData;
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again shortly.';
      default:
        return errorData;
    }
  }

  // Auth
  async register(data: { name: string; email: string; password: string; sport?: string; turnstile_token?: string }) {
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

  async googleAuth(credential: string) {
    const res = await this.request<{ ok: boolean; token: string; user: User; isNewUser: boolean }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
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

  // Password Reset
  async requestPasswordReset(email: string) {
    return this.request<{ ok: boolean }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, password: string) {
    return this.request<{ ok: boolean }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
  }

  // Email Verification
  async verifyEmail(token: string) {
    return this.request<{ ok: boolean; message: string }>(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
  }

  async resendVerification() {
    return this.request<{ ok: boolean }>('/api/auth/resend-verification', { method: 'POST' })
  }

  // Account Deletion
  async deleteAccount(confirmation: string) {
    return this.request<{ ok: boolean; message: string }>('/api/account/delete', {
      method: 'POST',
      body: JSON.stringify({ confirmation }),
    })
  }

  // Report / Flag
  async reportUser(userId: number, reason: string, details?: string) {
    return this.request<{ ok: boolean }>('/api/report', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, reason, details }),
    })
  }

  // Avatar Upload
  async uploadAvatar(base64DataUrl: string) {
    return this.request<{ ok: boolean; avatar_url: string }>('/api/upload-avatar', {
      method: 'POST',
      body: JSON.stringify({ avatar: base64DataUrl }),
    })
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

  // Subscriptions & Checkout
  async getSubscriptionStatus() {
    return this.request<{ ok: boolean; subscription: Subscription }>('/api/subscriptions/status');
  }

  async updateInstagram(username: string) {
    return this.request<{ ok: boolean }>('/api/profile/instagram', {
      method: 'PUT',
      body: JSON.stringify({ instagram_username: username }),
    });
  }

  async createCheckout(plan: 'premium_athlete' | 'premium_gym') {
    return this.request<{ ok: boolean; url: string; session_id: string }>('/api/checkout/create', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
  }

  // Community Posts
  async getPosts(params?: { type?: string; sport?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.sport) query.set('sport', params.sport);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    const qs = query.toString();
    return this.request<{ ok: boolean; posts: Post[]; total: number }>(`/api/posts${qs ? '?' + qs : ''}`);
  }

  async createPost(data: { title: string; body: string; type: string; sport?: string; media_url?: string }) {
    return this.request<{ ok: boolean; post_id: number }>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPost(postId: number) {
    return this.request<{ ok: boolean; post: Post }>(`/api/posts/${postId}`);
  }

  async deletePost(postId: number) {
    return this.request<{ ok: boolean }>(`/api/posts/${postId}`, { method: 'DELETE' });
  }

  async toggleLike(postId: number) {
    return this.request<{ ok: boolean; liked: boolean; likes_count?: number }>(`/api/posts/${postId}/like`, { method: 'POST' });
  }

  // Gym Documents
  async getGymDocuments(gymId: number) {
    return this.request<{ ok: boolean; documents: GymDocument[] }>(`/api/gyms/${gymId}/documents`);
  }

  async uploadGymDocument(gymId: number, data: { type: string; name: string; file_data: string }) {
    return this.request<{ ok: boolean; document_id: number }>(`/api/gyms/${gymId}/documents`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteGymDocument(gymId: number, docId: number) {
    return this.request<{ ok: boolean }>(`/api/gyms/${gymId}/documents/${docId}`, { method: 'DELETE' });
  }

  // Private Lessons
  async getPrivateLessons(gymId: number) {
    return this.request<{ ok: boolean; lessons: PrivateLesson[] }>(`/api/gyms/${gymId}/lessons`);
  }

  async createPrivateLesson(gymId: number, data: { sport: string; title: string; description?: string; price_cents: number; duration_minutes: number; coach_user_id?: number }) {
    return this.request<{ ok: boolean; lesson_id: number }>(`/api/gyms/${gymId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
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

  // Admin
  async getAdminStats() {
    return this.request<{ ok: boolean; stats: AdminStats }>('/api/admin/stats')
  }

  async getAdminUsers(params?: { search?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    const qs = query.toString();
    return this.request<{ ok: boolean; users: AdminUser[]; total: number }>(`/api/admin/users${qs ? '?' + qs : ''}`)
  }

  async getAdminReports(status?: string) {
    const qs = status ? `?status=${status}` : '';
    return this.request<{ ok: boolean; reports: AdminReport[] }>(`/api/admin/reports${qs}`)
  }

  async resolveReport(reportId: number, status: string) {
    return this.request<{ ok: boolean }>(`/api/admin/reports/${reportId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    })
  }

  // Post Comments
  async getPostComments(postId: number) {
    return this.request<{ ok: boolean; comments: Comment[]; total: number }>(`/api/posts/${postId}/comments`);
  }

  async createPostComment(postId: number, body: string, parentId?: number) {
    return this.request<{ ok: boolean; comment: Comment; comment_id: number }>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body, parent_id: parentId }),
    });
  }

  async deleteComment(commentId: number) {
    return this.request<{ ok: boolean }>(`/api/comments/${commentId}`, { method: 'DELETE' });
  }

  // Feedback
  async submitFeedback(data: { type?: string; rating?: number; title?: string; body: string; page?: string }) {
    return this.request<{ ok: boolean; feedback_id: number }>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAdminFeedback(status?: string, limit?: number) {
    const query = new URLSearchParams();
    if (status) query.set('status', status);
    if (limit) query.set('limit', String(limit));
    const qs = query.toString();
    return this.request<{ ok: boolean; feedback: Feedback[] }>(`/api/admin/feedback${qs ? '?' + qs : ''}`);
  }

  // Invite Codes (Alpha)
  async validateInviteCode(code: string) {
    return this.request<{ ok: boolean; valid: boolean; remaining: number }>('/api/invite/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async redeemInviteCode(code: string) {
    return this.request<{ ok: boolean; message: string }>('/api/invite/redeem', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async createInviteCode(maxUses?: number, expiresAt?: string, code?: string) {
    return this.request<{ ok: boolean; code: string }>('/api/admin/invite-codes', {
      method: 'POST',
      body: JSON.stringify({ max_uses: maxUses, expires_at: expiresAt, code }),
    });
  }

  // User Invite Codes (Alpha)
  async getMyInviteCodes() {
    return this.request<{ ok: boolean; codes: { code: string; max_uses: number; times_used: number; created_at: string }[] }>('/api/invite/my-codes');
  }

  async generateInviteCode() {
    return this.request<{ ok: boolean; invite: { code: string; max_uses: number; times_used: number; created_at: string } }>('/api/invite/generate', {
      method: 'POST',
    });
  }

  // Support / Donations
  async createSupportDonation(data: { amount_cents: number; donor_name?: string; donor_email?: string; message?: string; cause?: string }) {
    return this.request<{ ok: boolean; donation_id: number; status: string; url?: string }>('/api/support/donate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSupportStats() {
    return this.request<{ ok: boolean; stats: SupportStats }>('/api/support/stats');
  }

  // Gym Owner Management
  async getMyGym() {
    return this.request<{ ok: boolean; gym: GymOwnerDetail }>('/api/gym/mine');
  }

  async updateMyGym(data: Partial<Omit<Gym, 'id' | 'verified' | 'premium' | 'rating' | 'review_count'>>) {
    return this.request<{ ok: boolean }>('/api/gym/mine', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Subscription Management
  async cancelSubscription() {
    return this.request<{ ok: boolean; message: string }>('/api/subscriptions/cancel', { method: 'POST' });
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
  google_id?: string;
  instagram_username?: string;
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
  instagram_username?: string;
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

export interface Post {
  id: number;
  user_id: number;
  author_name: string;
  author_avatar: string;
  title: string;
  body: string;
  type: string;
  sport: string;
  media_url: string;
  likes_count: number;
  liked: boolean;
  comment_count: number;
  created_at: string;
}

export interface GymDocument {
  id: number;
  gym_id: number;
  type: string;
  name: string;
  verified: number;
  uploaded_at: string;
}

export interface PrivateLesson {
  id: number;
  gym_id: number;
  coach_user_id: number;
  coach_name: string;
  coach_avatar: string;
  sport: string;
  title: string;
  description: string;
  price_cents: number;
  duration_minutes: number;
  available: number;
  created_at: string;
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

export interface AdminStats {
  total_users: number;
  complete_profiles: number;
  total_gyms: number;
  total_messages: number;
  pending_reports: number;
  active_bookings: number;
  recent_signups: number;
}

export interface AdminUser {
  id: number;
  email: string;
  display_name: string;
  role: string;
  city: string;
  email_verified: number;
  created_at: string;
}

export interface AdminReport {
  id: number;
  reporter_id: number;
  reported_id: number;
  reporter_name: string;
  reporter_email: string;
  reported_name: string;
  reported_email: string;
  reason: string;
  details: string;
  status: string;
  created_at: string;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  body: string;
  parent_id: number | null;
  author_name: string;
  author_avatar: string;
  created_at: string;
}

export interface Feedback {
  id: number;
  user_id: number | null;
  type: string;
  rating: number | null;
  title: string;
  body: string;
  page: string;
  user_agent: string;
  status: string;
  user_name?: string;
  user_email?: string;
  created_at: string;
}

export interface InviteCode {
  id: number;
  code: string;
  created_by: number;
  max_uses: number;
  current_uses: number;
  expires_at: string | null;
  is_active: number;
  created_at: string;
}

export interface SupportDonation {
  id: number;
  user_id: number | null;
  donor_name: string;
  donor_email: string;
  amount_cents: number;
  message: string;
  cause: string;
  status: string;
  created_at: string;
}

export interface SupportStats {
  total_donations: number;
  total_raised_cents: number;
  unique_donors: number;
}

export interface MiloHealthMetrics {
  total_users: number;
  messages_24h: number;
  bookings_24h: number;
  pending_reports: number;
  new_feedback: number;
  posts_24h: number;
}

export interface MiloOverview {
  total_users: number;
  new_users_7d: number;
  avg_profile_completion: number;
  total_gyms: number;
  bug_reports_7d: number;
}

export interface GymOwnerDetail extends Gym {
  sessions: GymSession[];
  reviews: GymReview[];
  documents: GymDocument[];
}

/** Check if a subscription plan grants premium access */
export function isPremiumPlan(plan?: string | null): boolean {
  return plan === 'premium' || plan === 'premium_athlete' || plan === 'premium_gym';
}

export const api = new ApiClient();
export default api;
