import { logPerformance } from '../logger';

// Performance monitoring utilities

export interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

// Create a performance timer
export function createTimer(name: string): {
  end: (metadata?: Record<string, any>) => number;
} {
  const startTime = performance.now();

  return {
    end: (metadata?: Record<string, any>) => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      logPerformance({
        metric: name,
        value: Math.round(duration),
        unit: 'ms',
        context: metadata,
      });

      return duration;
    },
  };
}

// Measure async function execution time
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const timer = createTimer(name);
  try {
    const result = await fn();
    timer.end({ ...metadata, success: true });
    return result;
  } catch (error) {
    timer.end({ ...metadata, success: false, error: String(error) });
    throw error;
  }
}

// Measure sync function execution time
export function measureSync<T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, any>
): T {
  const timer = createTimer(name);
  try {
    const result = fn();
    timer.end({ ...metadata, success: true });
    return result;
  } catch (error) {
    timer.end({ ...metadata, success: false, error: String(error) });
    throw error;
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  if (typeof window === 'undefined') {
    return {
      measureRender: () => {},
      measureInteraction: () => {},
      getMetrics: () => ({}),
    };
  }

  const measureRender = (componentName: string) => {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      logPerformance({
        metric: `render_${componentName}`,
        value: Math.round(duration),
        unit: 'ms',
      });
    };
  };

  const measureInteraction = (interactionName: string) => {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      logPerformance({
        metric: `interaction_${interactionName}`,
        value: Math.round(duration),
        unit: 'ms',
      });
    };
  };

  const getMetrics = () => {
    if (!window.performance || !window.performance.getEntriesByType) {
      return {};
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    return {
      // Navigation timing
      dns: navigation?.domainLookupEnd - navigation?.domainLookupStart,
      tcp: navigation?.connectEnd - navigation?.connectStart,
      ttfb: navigation?.responseStart - navigation?.requestStart,
      download: navigation?.responseEnd - navigation?.responseStart,
      domInteractive: navigation?.domInteractive,
      domComplete: navigation?.domComplete,
      loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,

      // Paint timing
      firstPaint: paint.find((entry) => entry.name === 'first-paint')?.startTime,
      firstContentfulPaint: paint.find((entry) => entry.name === 'first-contentful-paint')?.startTime,
    };
  };

  return {
    measureRender,
    measureInteraction,
    getMetrics,
  };
}

// Monitor API request performance
export function monitorAPIRequest(
  method: string,
  path: string,
  handler: () => Promise<Response>
): Promise<Response> {
  return measureAsync(
    `api_${method}_${path}`,
    handler,
    { method, path }
  );
}

// Monitor database query performance
export async function monitorDBQuery<T>(
  collection: string,
  operation: string,
  query: () => Promise<T>
): Promise<T> {
  return measureAsync(
    `db_${operation}_${collection}`,
    query,
    { collection, operation }
  );
}

// Monitor AI request performance
export async function monitorAIRequest<T>(
  toolId: string,
  request: () => Promise<T>
): Promise<T> {
  return measureAsync(
    `ai_request_${toolId}`,
    request,
    { toolId }
  );
}

// Web Vitals monitoring (client-side only)
export function reportWebVitals(metric: {
  id: string;
  name: string;
  value: number;
  label: 'web-vital' | 'custom';
}) {
  if (typeof window === 'undefined') return;

  logPerformance({
    metric: `web_vital_${metric.name}`,
    value: Math.round(metric.value),
    unit: 'ms',
    context: {
      id: metric.id,
      label: metric.label,
    },
  });

  // Send to analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.value,
    });
  }
}

// Memory usage monitoring (Node.js only)
export function getMemoryUsage() {
  if (typeof process === 'undefined' || !process.memoryUsage) {
    return null;
  }

  const usage = process.memoryUsage();
  return {
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024), // MB
    rss: Math.round(usage.rss / 1024 / 1024), // MB
  };
}

// Log memory usage periodically
export function startMemoryMonitoring(intervalMs: number = 60000) {
  if (typeof process === 'undefined') return;

  const interval = setInterval(() => {
    const memory = getMemoryUsage();
    if (memory) {
      logPerformance({
        metric: 'memory_heap_used',
        value: memory.heapUsed,
        unit: 'bytes',
        context: memory,
      });
    }
  }, intervalMs);

  return () => clearInterval(interval);
}
