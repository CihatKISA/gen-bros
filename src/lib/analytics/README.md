# Analytics Tracking

This directory contains analytics tracking utilities for monitoring user behavior and application usage.

## Overview

The analytics system tracks key user events and sends them to Google Analytics 4 (GA4) or other analytics platforms.

## Setup

### Google Analytics 4

1. Create a GA4 property in Google Analytics
2. Get your Measurement ID (format: `G-XXXXXXXXXX`)
3. Add to your environment variables:

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

4. Add the GA4 script to your root layout:

```tsx
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## Usage

### In React Components

```tsx
import { useAnalytics } from '@/src/lib/analytics';

function MyComponent() {
  const { trackTopicGeneration, trackTopicSave } = useAnalytics();

  const handleGenerate = async () => {
    try {
      const result = await generateTopics();
      
      trackTopicGeneration({
        category: 'Digital Marketing',
        success: true,
        tokensUsed: result.tokensUsed,
        duration: result.duration,
      });
    } catch (error) {
      trackTopicGeneration({
        category: 'Digital Marketing',
        success: false,
        error: error.message,
      });
    }
  };

  return <button onClick={handleGenerate}>Generate</button>;
}
```

### Direct Function Calls

```typescript
import { trackEvent, trackPageView } from '@/src/lib/analytics';

// Track custom event
trackEvent('button_click', {
  button_name: 'subscribe',
  location: 'header',
});

// Track page view
trackPageView('/dashboard', 'User Dashboard');
```

## Tracked Events

### Topic Generation

```typescript
trackTopicGeneration({
  category: string;
  success: boolean;
  tokensUsed?: number;
  duration?: number;
  error?: string;
});
```

### Topic Save

```typescript
trackTopicSave({
  toolId: string;
  category?: string;
  success: boolean;
});
```

### Topic Delete

```typescript
trackTopicDelete({
  topicId: string;
  toolId: string;
});
```

### User Registration

```typescript
trackUserRegistration({
  success: boolean;
  method?: string;
  error?: string;
});
```

### User Login

```typescript
trackUserLogin({
  success: boolean;
  method?: string;
  error?: string;
});
```

### User Logout

```typescript
trackUserLogout();
```

### Rate Limit Hit

```typescript
trackRateLimitHit({
  toolId: string;
  remaining: number;
});
```

### Error Tracking

```typescript
trackError({
  error: string;
  context?: string;
  fatal?: boolean;
});
```

## Custom Events

Track custom events using the generic `trackEvent` function:

```typescript
import { trackEvent } from '@/src/lib/analytics';

trackEvent('custom_event_name', {
  property1: 'value1',
  property2: 123,
  property3: true,
});
```

## Event Properties

All events automatically include:

- `timestamp`: ISO 8601 timestamp
- `userId`: User ID (if authenticated)
- `sessionId`: Session identifier
- `page_path`: Current page path
- `page_title`: Current page title

## Privacy Considerations

### GDPR Compliance

1. **Consent Management**: Implement a cookie consent banner
2. **Anonymize IP**: Enable IP anonymization in GA4
3. **Data Retention**: Configure appropriate data retention periods
4. **User Rights**: Provide mechanisms for data deletion requests

### PII Protection

Never track personally identifiable information:

- ❌ Email addresses
- ❌ Phone numbers
- ❌ Full names
- ❌ Addresses
- ✅ User IDs (hashed)
- ✅ Anonymous identifiers

## Development Mode

In development, events are logged to the console instead of being sent to analytics:

```typescript
// Console output in development
[Analytics] {
  name: 'topic_generation',
  properties: {
    category: 'Digital Marketing',
    success: true,
    tokens_used: 1500
  },
  timestamp: '2024-01-15T10:30:00.000Z'
}
```

## Analytics Dashboard

### Key Metrics to Monitor

1. **User Engagement**
   - Daily/Monthly Active Users
   - Session duration
   - Pages per session

2. **Feature Usage**
   - Topic generations per day
   - Topics saved per user
   - Most popular categories

3. **Conversion Funnel**
   - Guest → Registration
   - Registration → First generation
   - Generation → Save

4. **Performance**
   - Average generation time
   - Error rates
   - Rate limit hits

### Custom Reports

Create custom reports in GA4 for:

- **Tool Usage**: Track which AI tools are most popular
- **Category Analysis**: Identify trending content categories
- **User Journey**: Understand the path from discovery to conversion
- **Error Analysis**: Monitor error patterns and frequencies

## Integration with Other Platforms

### Mixpanel

```typescript
import mixpanel from 'mixpanel-browser';

mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN);

export function trackEvent(name: string, properties?: Record<string, any>) {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', name, properties);
  }
  
  // Mixpanel
  mixpanel.track(name, properties);
}
```

### Segment

```typescript
import { Analytics } from '@segment/analytics-next';

const analytics = new Analytics({
  writeKey: process.env.NEXT_PUBLIC_SEGMENT_KEY,
});

export function trackEvent(name: string, properties?: Record<string, any>) {
  analytics.track(name, properties);
}
```

## Testing

### Manual Testing

1. Open browser DevTools
2. Go to Network tab
3. Filter by "google-analytics" or "gtag"
4. Trigger events in your app
5. Verify requests are sent

### Automated Testing

```typescript
// Mock analytics in tests
jest.mock('@/src/lib/analytics', () => ({
  useAnalytics: () => ({
    trackTopicGeneration: jest.fn(),
    trackTopicSave: jest.fn(),
    // ... other functions
  }),
}));
```

## Best Practices

1. **Event Naming**: Use snake_case for consistency
2. **Property Naming**: Use descriptive, lowercase names
3. **Event Volume**: Don't track too many events (focus on key actions)
4. **Testing**: Always test events in development before deploying
5. **Documentation**: Document all custom events and their properties

## Troubleshooting

### Events Not Showing in GA4

1. Check that `NEXT_PUBLIC_GA_ID` is set correctly
2. Verify the GA4 script is loaded (check Network tab)
3. Check browser console for errors
4. Use GA4 DebugView for real-time debugging
5. Wait 24-48 hours for data to appear in standard reports

### Events Not Firing

1. Check browser console for JavaScript errors
2. Verify `window.gtag` is defined
3. Check that events are called after component mount
4. Ensure analytics script loads before tracking calls

### Development vs Production

Remember that `NEXT_PUBLIC_*` variables must be set at build time:

```bash
# Development
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX npm run dev

# Production build
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX npm run build
```

## Resources

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [Next.js Analytics](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)
