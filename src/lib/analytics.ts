// Centralized analytics tracking for Training Partner
// Wraps PostHog with typed, domain-specific events
// All events are no-ops if PostHog isn't initialized (safe for dev/test)

import posthog from 'posthog-js'

// ─── Event Types ─────────────────────────────────────────────
// Every trackable user action, grouped by feature area.
// This makes it easy to query patterns like "show me all onboarding events"

type EventProperties = Record<string, string | number | boolean | null | undefined>

// ─── Core Tracker ────────────────────────────────────────────

function track(event: string, properties?: EventProperties) {
  try {
    if (typeof window !== 'undefined' && posthog.__loaded) {
      posthog.capture(event, {
        ...properties,
        // Always include current page for context
        $current_url: window.location.href,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
      })
    }
  } catch {
    // Never let analytics break the app
  }
}

// ─── User Identity ───────────────────────────────────────────

export function identifyUser(userId: string, traits?: {
  name?: string
  email?: string
  sport?: string
  accountAge?: number
  plan?: string
}) {
  try {
    if (typeof window !== 'undefined' && posthog.__loaded) {
      posthog.identify(userId, traits)
    }
  } catch {}
}

export function resetUser() {
  try {
    if (typeof window !== 'undefined' && posthog.__loaded) {
      posthog.reset()
    }
  } catch {}
}

// ─── Auth Events ─────────────────────────────────────────────

export function trackSignup(method: 'email' | 'google', sport?: string) {
  track('signup_completed', { method, sport: sport || null })
}

export function trackLogin(method: 'email' | 'google') {
  track('login_completed', { method })
}

export function trackLogout() {
  track('logout')
  resetUser()
}

// ─── Onboarding Events ──────────────────────────────────────

export function trackOnboardingStep(step: number, stepName: string, completed: boolean) {
  track('onboarding_step', { step, step_name: stepName, completed })
}

export function trackOnboardingCompleted(totalTimeMs: number) {
  track('onboarding_completed', { total_time_ms: totalTimeMs })
}

export function trackOnboardingAbandoned(lastStep: number, lastStepName: string) {
  track('onboarding_abandoned', { last_step: lastStep, last_step_name: lastStepName })
}

// ─── Partner Discovery ───────────────────────────────────────

export function trackPartnerSearch(filters: {
  sport?: string
  city?: string
  skillLevel?: string
  resultsCount?: number
}) {
  track('partner_search', {
    sport: filters.sport || null,
    city: filters.city || null,
    skill_level: filters.skillLevel || null,
    results_count: filters.resultsCount ?? null,
  })
}

export function trackPartnerView(partnerId: string, sport?: string) {
  track('partner_profile_viewed', { partner_id: partnerId, sport: sport || null })
}

export function trackPartnerConnect(partnerId: string, method: 'message' | 'invite' | 'favorite') {
  track('partner_connect', { partner_id: partnerId, method })
}

// ─── Messaging ───────────────────────────────────────────────

export function trackMessageSent(conversationId: string, messageLength: number) {
  track('message_sent', {
    conversation_id: conversationId,
    message_length: messageLength,
  })
}

export function trackConversationOpened(conversationId: string) {
  track('conversation_opened', { conversation_id: conversationId })
}

// ─── Training Log ────────────────────────────────────────────

export function trackWorkoutLogged(activity: string, durationMin?: number) {
  track('workout_logged', {
    activity,
    duration_min: durationMin ?? null,
  })
}

export function trackTrainingLogViewed() {
  track('training_log_viewed')
}

// ─── Gym Features ────────────────────────────────────────────

export function trackGymViewed(gymId: string) {
  track('gym_viewed', { gym_id: gymId })
}

export function trackGymCheckin(gymId: string) {
  track('gym_checkin', { gym_id: gymId })
}

// ─── Community ───────────────────────────────────────────────

export function trackPostCreated(type: string) {
  track('post_created', { post_type: type })
}

export function trackPostViewed(postId: string) {
  track('post_viewed', { post_id: postId })
}

// ─── Profile ─────────────────────────────────────────────────

export function trackProfileEdited(fields: string[]) {
  track('profile_edited', { fields_changed: fields.join(','), field_count: fields.length })
}

export function trackAvatarUploaded() {
  track('avatar_uploaded')
}

// ─── Navigation & Engagement ─────────────────────────────────

export function trackFeatureDiscovered(feature: string) {
  track('feature_discovered', { feature })
}

export function trackPageTimeSpent(page: string, timeMs: number) {
  track('page_time_spent', { page, time_ms: timeMs, time_seconds: Math.round(timeMs / 1000) })
}

// ─── Errors & Friction ───────────────────────────────────────

export function trackError(error: string, context?: {
  component?: string
  action?: string
  page?: string
}) {
  track('client_error', {
    error_message: error,
    component: context?.component || null,
    action: context?.action || null,
    page: context?.page || window?.location?.pathname || null,
  })
}

export function trackApiError(endpoint: string, status: number, message: string) {
  track('api_error', {
    endpoint,
    status,
    error_message: message,
  })
}

// ─── Feedback (ties widget submissions to PostHog sessions) ──

export function trackFeedbackSubmitted(type: string, rating: number | null, page: string) {
  track('feedback_submitted', { feedback_type: type, rating, page })
}

// ─── Subscription ────────────────────────────────────────────

export function trackSubscriptionViewed(currentPlan: string) {
  track('subscription_viewed', { current_plan: currentPlan })
}

export function trackSubscriptionStarted(plan: string) {
  track('subscription_started', { plan })
}

// ─── Batch export for convenience ────────────────────────────

const analytics = {
  track,
  identifyUser,
  resetUser,
  trackSignup,
  trackLogin,
  trackLogout,
  trackOnboardingStep,
  trackOnboardingCompleted,
  trackOnboardingAbandoned,
  trackPartnerSearch,
  trackPartnerView,
  trackPartnerConnect,
  trackMessageSent,
  trackConversationOpened,
  trackWorkoutLogged,
  trackTrainingLogViewed,
  trackGymViewed,
  trackGymCheckin,
  trackPostCreated,
  trackPostViewed,
  trackProfileEdited,
  trackAvatarUploaded,
  trackFeatureDiscovered,
  trackPageTimeSpent,
  trackError,
  trackApiError,
  trackFeedbackSubmitted,
  trackSubscriptionViewed,
  trackSubscriptionStarted,
}

export default analytics
