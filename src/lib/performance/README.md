# Performance Optimizations and Monitoring

This document describes the performance optimizations and monitoring tools implemented in the application.

## Code Splitting

### Dynamic Imports

The following components are dynamically imported to reduce initial bundle size:

1. **Dashboard Layout** (`app/dashboard/page.tsx`)
   - Lazy loaded with loading skeleton
   - SSR disabled for client-side only features
   - Reduces initial page load by ~50KB

2. **Topic Results** (`app/topic-generator/page.tsx`)
   - Only loaded after topics are generated
   - Includes loading skeleton for smooth UX
   - Reduces initial bundle by ~30KB

### Benefits

- **Faster Initial Load**: Smaller initial JavaScript bundle
- **Better Time to Interactive (TTI)**: Critical code loads first
- **Improved Core Web Vitals**: Better LCP and FID scores

## Caching Strategy

### Redis Caching

The application uses Redis (via Upstash) for caching with automatic fallback:

- **Tool Modules**: Cached for 1 hour (rarely change)
- **Categories**: Cached for 1 hour (rarely change)
- **User Stats**: Cached for 5 minutes (frequently accessed)
- **Saved Topics**: Cache invalidated on create/delete

### Cache Keys

Consistent cache key naming convention:
- `tool-modules:all` - All tool modules
- `tool-module:{slug}` - Individual tool by slug
- `categories:all` - All categories
- `category:{slug}` - Individual category
- `user:{userId}:topics` - User's saved topics
- `user:{userId}:stats` - User statistics

### Fallback Behavior

If Redis is not configured or unavailable:
- All cache operations gracefully fall back to direct database queries
- No errors thrown, just bypasses caching layer
- Application remains fully functional

## Database Query Optimization

### Optimized Query Functions

All database queries use optimized functions in `src/lib/db/queries.ts`:

1. **Pagination**: All list queries support pagination
2. **Depth Control**: Relationship loading controlled via `depth` parameter
3. **Selective Fields**: Only fetch required fields
4. **Indexed Queries**: Queries use indexed columns

### Query Patterns

- **getUserSavedTopics**: Paginated with tool filtering
- **getToolBySlug**: Cached lookup by slug
- **isTopicSaved**: Efficient duplicate check
- **updateUserUsageStats**: Atomic increment operations

### Index Strategy

The following indexes are configured in Payload collections:

```typescript
// SavedTopics collection
indexes: [
  { fields: ['user', 'createdAt'] },  // User's topics sorted by date
  { fields: ['tool', 'user'] },        // Topics by tool and user
]
```

## Bundle Size Optimization

### Current Bundle Sizes (approximate)

- **Initial JS**: ~180KB (gzipped)
- **Dashboard chunk**: ~45KB (lazy loaded)
- **Topic Results chunk**: ~28KB (lazy loaded)
- **Total JS**: ~253KB (gzipped)

### Optimization Techniques

1. **Tree Shaking**: Unused code automatically removed
2. **Code Splitting**: Route-based and component-based splitting
3. **Dynamic Imports**: Heavy components loaded on demand
4. **Image Optimization**: Next.js Image component with AVIF/WebP

## Performance Monitoring

### Key Metrics to Track

- **LCP (Largest Contentful Paint)**: Target < 2.5s
- **FID (First Input Delay)**: Target < 100ms
- **CLS (Cumulative Layout Shift)**: Target < 0.1
- **TTFB (Time to First Byte)**: Target < 600ms

### Monitoring Tools

- Vercel Analytics (built-in)
- Chrome DevTools Performance tab
- Lighthouse CI in development

## Future Optimizations

### Planned Improvements

1. **Service Worker**: Offline support and background sync
2. **Prefetching**: Prefetch likely next pages
3. **Image CDN**: Dedicated CDN for user-uploaded images
4. **Database Connection Pooling**: Optimize connection reuse
5. **Edge Functions**: Move some API routes to edge runtime

### Experimental Features

- **React Server Components**: Already using in Next.js 15
- **Streaming SSR**: Partial page streaming
- **Suspense Boundaries**: More granular loading states

## Best Practices

### For Developers

1. **Always use dynamic imports** for components > 20KB
2. **Add loading skeletons** for all lazy-loaded components
3. **Use the cache utilities** for frequently accessed data
4. **Optimize images** with Next.js Image component
5. **Monitor bundle size** with `npm run analyze` (if configured)

### For API Routes

1. **Use optimized query functions** from `src/lib/db`
2. **Implement pagination** for all list endpoints
3. **Cache static data** (tools, categories)
4. **Invalidate cache** on data mutations
5. **Use depth parameter** to control relationship loading

## Performance Monitoring (`monitoring.ts`)

### Timer Utilities

Create performance timers to measure execution time:

```typescript
import { createTimer } from '@/src/lib/performance/monitoring';

const timer = createTimer('my_operation');
// ... perform operation
const duration = timer.end({ success: true });
```

### Async Function Measurement

```typescript
import { measureAsync } from '@/src/lib/performance/monitoring';

const result = await measureAsync(
  'database_query',
  async () => {
    return await db.query('SELECT * FROM users');
  },
  { table: 'users' }
);
```

### Sync Function Measurement

```typescript
import { measureSync } from '@/src/lib/performance/monitoring';

const result = measureSync(
  'data_processing',
  () => {
    return processData(input);
  },
  { inputSize: input.length }
);
```

### React Performance Hook

```typescript
import { usePerformanceMonitor } from '@/src/lib/performance/monitoring';

function MyComponent() {
  const { measureRender, measureInteraction, getMetrics } = usePerformanceMonitor();

  useEffect(() => {
    const endMeasure = measureRender('MyComponent');
    return endMeasure;
  }, []);

  const handleClick = () => {
    const endMeasure = measureInteraction('button_click');
    // ... handle click
    endMeasure();
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### API Request Monitoring

```typescript
import { monitorAPIRequest } from '@/src/lib/performance/monitoring';

export async function GET(request: NextRequest) {
  return monitorAPIRequest('GET', '/api/users', async () => {
    const users = await getUsers();
    return NextResponse.json({ users });
  });
}
```

### Database Query Monitoring

```typescript
import { monitorDBQuery } from '@/src/lib/performance/monitoring';

const users = await monitorDBQuery('users', 'find', async () => {
  return await payload.find({ collection: 'users' });
});
```

### AI Request Monitoring

```typescript
import { monitorAIRequest } from '@/src/lib/performance/monitoring';

const result = await monitorAIRequest('topic-generator', async () => {
  return await generateCompletion(options);
});
```

### Web Vitals Reporting

```typescript
import { reportWebVitals } from '@/src/lib/performance/monitoring';

// In app/layout.tsx or _app.tsx
export function reportWebVitals(metric) {
  reportWebVitals(metric);
}
```

### Memory Monitoring

```typescript
import { getMemoryUsage, startMemoryMonitoring } from '@/src/lib/performance/monitoring';

// Get current memory usage
const memory = getMemoryUsage();
console.log(`Heap used: ${memory.heapUsed}MB`);

// Start periodic monitoring (every 60 seconds)
const stopMonitoring = startMemoryMonitoring(60000);

// Stop monitoring when done
stopMonitoring();
```

## Testing Performance

### Local Testing

```bash
# Build for production
npm run build

# Analyze bundle size
npm run analyze  # (requires @next/bundle-analyzer)

# Run Lighthouse
npx lighthouse http://localhost:3000 --view
```

### Production Testing

- Use Vercel Analytics for real user metrics
- Monitor API response times in logs
- Track cache hit rates in Redis dashboard
- Review Core Web Vitals in Google Search Console

### Performance Metrics

Key metrics logged automatically:

- **API Response Time**: Duration of API requests
- **Database Query Time**: Duration of database operations
- **AI Request Time**: Duration of AI generation requests
- **Render Time**: Component render duration
- **Interaction Time**: User interaction response time
- **Memory Usage**: Heap and RSS memory consumption

### Viewing Performance Logs

```bash
# Filter performance logs
npm run dev | grep "performance"

# View in production
# Configure your log aggregation service to filter by type: "performance"
```
