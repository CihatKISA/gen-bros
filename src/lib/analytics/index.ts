// Analytics tracking for key user events

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: string;
}

// Track generic events
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  if (typeof window === 'undefined') return;

  const event: AnalyticsEvent = {
    name: eventName,
    properties,
    timestamp: new Date().toISOString(),
  };

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', eventName, properties);
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event);
  }
}

// Track page views
export function trackPageView(url: string, title?: string) {
  if (typeof window === 'undefined') return;

  if (window.gtag && process.env.NEXT_PUBLIC_GA_ID) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
      page_title: title,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Page view:', url, title);
  }
}

// Specific event tracking functions

export function trackTopicGeneration(data: {
  category: string;
  success: boolean;
  tokensUsed?: number;
  duration?: number;
  error?: string;
}) {
  trackEvent('topic_generation', {
    category: data.category,
    success: data.success,
    tokens_used: data.tokensUsed,
    duration_ms: data.duration,
    error: data.error,
  });
}

export function trackTopicSave(data: {
  toolId: string;
  category?: string;
  success: boolean;
}) {
  trackEvent('topic_save', {
    tool_id: data.toolId,
    category: data.category,
    success: data.success,
  });
}

export function trackTopicDelete(data: {
  topicId: string;
  toolId: string;
}) {
  trackEvent('topic_delete', {
    topic_id: data.topicId,
    tool_id: data.toolId,
  });
}

export function trackUserRegistration(data: {
  success: boolean;
  method?: string;
  error?: string;
}) {
  trackEvent('user_registration', {
    success: data.success,
    method: data.method || 'email',
    error: data.error,
  });
}

export function trackUserLogin(data: {
  success: boolean;
  method?: string;
  error?: string;
}) {
  trackEvent('user_login', {
    success: data.success,
    method: data.method || 'email',
    error: data.error,
  });
}

export function trackUserLogout() {
  trackEvent('user_logout', {});
}

export function trackRateLimitHit(data: {
  toolId: string;
  remaining: number;
}) {
  trackEvent('rate_limit_hit', {
    tool_id: data.toolId,
    remaining: data.remaining,
  });
}

export function trackError(data: {
  error: string;
  context?: string;
  fatal?: boolean;
}) {
  trackEvent('error', {
    error_message: data.error,
    context: data.context,
    fatal: data.fatal || false,
  });
}

// Hook for React components
export function useAnalytics() {
  return {
    trackEvent,
    trackPageView,
    trackTopicGeneration,
    trackTopicSave,
    trackTopicDelete,
    trackUserRegistration,
    trackUserLogin,
    trackUserLogout,
    trackRateLimitHit,
    trackError,
  };
}

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}
