import pino from 'pino';

// Create logger instance with appropriate configuration
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  browser: {
    asObject: true,
  },
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'SYS:standard',
      },
    },
  }),
});

// AI Request logging
export interface AIRequestLog {
  userId?: string;
  toolId: string;
  category?: string;
  tokensUsed: number;
  processingTime: number;
  model: string;
  success: boolean;
  error?: string;
}

export function logAIRequest(data: AIRequestLog) {
  logger.info({
    type: 'ai_request',
    timestamp: new Date().toISOString(),
    ...data,
  }, 'AI request completed');
}

// Error logging with context
export function logError(error: Error, context?: Record<string, any>) {
  logger.error({
    type: 'error',
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    ...context,
  }, `Error: ${error.message}`);
}

// API request logging
export interface APIRequestLog {
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  userId?: string;
  userAgent?: string;
  ip?: string;
}

export function logAPIRequest(data: APIRequestLog) {
  logger.info({
    type: 'api_request',
    timestamp: new Date().toISOString(),
    ...data,
  }, `${data.method} ${data.path} ${data.statusCode}`);
}

// Authentication logging
export interface AuthLog {
  action: 'login' | 'logout' | 'register' | 'token_refresh';
  userId?: string;
  email?: string;
  success: boolean;
  reason?: string;
  ip?: string;
}

export function logAuth(data: AuthLog) {
  logger.info({
    type: 'auth',
    timestamp: new Date().toISOString(),
    ...data,
  }, `Auth: ${data.action} - ${data.success ? 'success' : 'failed'}`);
}

// Database operation logging
export interface DBLog {
  operation: 'create' | 'read' | 'update' | 'delete';
  collection: string;
  duration: number;
  success: boolean;
  error?: string;
}

export function logDBOperation(data: DBLog) {
  logger.debug({
    type: 'db_operation',
    timestamp: new Date().toISOString(),
    ...data,
  }, `DB: ${data.operation} ${data.collection}`);
}

// Rate limit logging
export interface RateLimitLog {
  userId: string;
  toolId: string;
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export function logRateLimit(data: RateLimitLog) {
  logger.warn({
    type: 'rate_limit',
    timestamp: new Date().toISOString(),
    ...data,
  }, `Rate limit ${data.allowed ? 'passed' : 'exceeded'} for user ${data.userId}`);
}

// Performance logging
export interface PerformanceLog {
  metric: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  context?: Record<string, any>;
}

export function logPerformance(data: PerformanceLog) {
  logger.debug({
    type: 'performance',
    timestamp: new Date().toISOString(),
    ...data,
  }, `Performance: ${data.metric} = ${data.value}${data.unit}`);
}

// User activity logging
export interface UserActivityLog {
  userId: string;
  action: string;
  resource?: string;
  metadata?: Record<string, any>;
}

export function logUserActivity(data: UserActivityLog) {
  logger.info({
    type: 'user_activity',
    timestamp: new Date().toISOString(),
    ...data,
  }, `User activity: ${data.action}`);
}
