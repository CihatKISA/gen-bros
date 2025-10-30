# Logging and Monitoring

This directory contains the logging and monitoring infrastructure for the application.

## Overview

The application uses **Pino** for structured logging with support for different log levels and pretty printing in development.

## Logger (`index.ts`)

### Configuration

The logger is configured based on the environment:

- **Development**: Pretty-printed, colorized logs with timestamps
- **Production**: JSON-formatted logs for log aggregation services

### Log Levels

- `debug`: Detailed debugging information
- `info`: General informational messages
- `warn`: Warning messages
- `error`: Error messages

Set the log level via the `LOG_LEVEL` environment variable (default: `info`).

### Logging Functions

#### AI Request Logging

```typescript
import { logAIRequest } from '@/src/lib/logger';

logAIRequest({
  userId: 'user-123',
  toolId: 'topic-generator',
  category: 'Digital Marketing',
  tokensUsed: 1500,
  processingTime: 3200,
  model: 'gpt-4o-mini',
  success: true,
});
```

#### Error Logging

```typescript
import { logError } from '@/src/lib/logger';

try {
  // Some operation
} catch (error) {
  logError(error as Error, {
    context: 'topic_generation',
    userId: 'user-123',
  });
}
```

#### API Request Logging

```typescript
import { logAPIRequest } from '@/src/lib/logger';

logAPIRequest({
  method: 'POST',
  path: '/api/tools/generate-topics',
  statusCode: 200,
  duration: 3500,
  userId: 'user-123',
  userAgent: 'Mozilla/5.0...',
});
```

#### Authentication Logging

```typescript
import { logAuth } from '@/src/lib/logger';

logAuth({
  action: 'login',
  userId: 'user-123',
  email: 'user@example.com',
  success: true,
  ip: '192.168.1.1',
});
```

#### User Activity Logging

```typescript
import { logUserActivity } from '@/src/lib/logger';

logUserActivity({
  userId: 'user-123',
  action: 'save_topic',
  resource: 'topic:456',
  metadata: {
    toolId: 'topic-generator',
    title: 'My Topic',
  },
});
```

#### Rate Limit Logging

```typescript
import { logRateLimit } from '@/src/lib/logger';

logRateLimit({
  userId: 'user-123',
  toolId: 'topic-generator',
  allowed: false,
  remaining: 0,
  resetAt: new Date(),
});
```

#### Performance Logging

```typescript
import { logPerformance } from '@/src/lib/logger';

logPerformance({
  metric: 'api_response_time',
  value: 250,
  unit: 'ms',
  context: {
    endpoint: '/api/tools/generate-topics',
  },
});
```

## Best Practices

### 1. Use Appropriate Log Levels

- `debug`: Detailed information for debugging (e.g., variable values, flow control)
- `info`: Important events (e.g., user actions, API requests)
- `warn`: Potentially harmful situations (e.g., rate limits, deprecated features)
- `error`: Error events that might still allow the application to continue

### 2. Include Context

Always include relevant context in your logs:

```typescript
logError(error, {
  context: 'payment_processing',
  userId: user.id,
  orderId: order.id,
  amount: order.total,
});
```

### 3. Structured Logging

Use structured data instead of string concatenation:

```typescript
// Good
logger.info({ userId: '123', action: 'login' }, 'User logged in');

// Bad
logger.info(`User ${userId} logged in`);
```

### 4. Sensitive Data

Never log sensitive information:

- Passwords
- API keys
- Credit card numbers
- Personal identification numbers
- Full email addresses in production (use hashing)

### 5. Performance

Avoid expensive operations in log statements:

```typescript
// Bad - always executes
logger.debug(`Complex data: ${JSON.stringify(expensiveOperation())}`);

// Good - only executes if debug level is enabled
if (logger.isLevelEnabled('debug')) {
  logger.debug({ data: expensiveOperation() }, 'Complex data');
}
```

## Log Aggregation

In production, logs should be sent to a log aggregation service:

- **Datadog**: Use `pino-datadog` transport
- **Logtail**: Use `@logtail/pino` transport
- **CloudWatch**: Use `pino-cloudwatch` transport
- **Elasticsearch**: Use `pino-elasticsearch` transport

Example configuration:

```typescript
import pino from 'pino';

const logger = pino({
  level: 'info',
  transport: {
    target: '@logtail/pino',
    options: {
      sourceToken: process.env.LOGTAIL_TOKEN,
    },
  },
});
```

## Monitoring Dashboards

Key metrics to monitor:

1. **Error Rate**: Percentage of requests resulting in errors
2. **Response Time**: P50, P95, P99 latencies
3. **AI Token Usage**: Total tokens consumed per hour/day
4. **Rate Limit Hits**: Number of rate limit violations
5. **User Activity**: Active users, registrations, logins

## Alerts

Set up alerts for:

- Error rate > 5%
- P95 response time > 2 seconds
- AI token usage > budget threshold
- Rate limit hits > 100 per hour
- Failed login attempts > 10 per minute (potential attack)

## Example: API Route with Logging

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { logAPIRequest, logError } from '@/src/lib/logger';
import { createTimer } from '@/src/lib/performance/monitoring';

export async function POST(request: NextRequest) {
  const timer = createTimer('api_my_endpoint');
  let statusCode = 200;

  try {
    // Your logic here
    const result = await processRequest();

    const response = NextResponse.json({ result });

    // Log successful request
    const duration = timer.end();
    logAPIRequest({
      method: 'POST',
      path: '/api/my-endpoint',
      statusCode,
      duration,
      userId: user?.id,
    });

    return response;
  } catch (error) {
    statusCode = 500;

    // Log error
    logError(error as Error, {
      context: 'my_endpoint',
      userId: user?.id,
    });

    // Log failed request
    const duration = timer.end();
    logAPIRequest({
      method: 'POST',
      path: '/api/my-endpoint',
      statusCode,
      duration,
    });

    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

## Testing

To test logging in development:

```bash
# Set log level to debug
LOG_LEVEL=debug npm run dev

# View logs in real-time
npm run dev | pino-pretty
```

## Environment Variables

- `LOG_LEVEL`: Set the minimum log level (default: `info`)
  - Options: `trace`, `debug`, `info`, `warn`, `error`, `fatal`

Example `.env`:

```bash
LOG_LEVEL=debug  # Development
# LOG_LEVEL=info  # Production
```
