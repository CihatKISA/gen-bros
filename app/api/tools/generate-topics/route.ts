import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/src/payload/payload.config'
import { generateCompletion } from '@/src/lib/ai/service'
import { buildTopicGeneratorPrompt, SYSTEM_PROMPTS } from '@/src/lib/ai/prompts'
import { checkRateLimit } from '@/src/lib/ai/rate-limiter'
import { topicGeneratorSchema, topicApiResponseSchema } from '@/src/lib/validation/schemas'
import { sanitizeCategory } from '@/src/lib/validation/sanitize'
import { handleError } from '@/src/lib/errors/handler'
import { getToolBySlug, updateUserUsageStats } from '@/src/lib/db'
import { logAPIRequest, logRateLimit } from '@/src/lib/logger'
import { createTimer } from '@/src/lib/performance/monitoring'

export async function POST(request: NextRequest) {
  const timer = createTimer('api_generate_topics')
  let statusCode = 200
  
  try {
    const payload = await getPayload({ config })
    
    // Parse and validate request body
    const body = await request.json()
    const validated = topicGeneratorSchema.parse(body)
    
    // Sanitize the category input
    const category = sanitizeCategory(validated.category)

    // Get user from session (optional for guests)
    const { user } = await payload.auth({ headers: request.headers })

    // Check rate limit if user is authenticated
    if (user) {
      // Find the topic-generator tool module using optimized query
      const tool = await getToolBySlug('topic-generator')

      if (tool) {
        const rateLimitConfig = {
          requestsPerHour: tool.rateLimits?.requestsPerHour || 10,
          requestsPerDay: tool.rateLimits?.requestsPerDay || 50,
        }

        const rateLimit = await checkRateLimit(
          user.id.toString(),
          tool.id.toString(),
          rateLimitConfig
        )

        // Log rate limit check
        logRateLimit({
          userId: user.id.toString(),
          toolId: tool.id.toString(),
          allowed: rateLimit.allowed,
          remaining: rateLimit.remaining,
          resetAt: rateLimit.resetAt,
        })

        if (!rateLimit.allowed) {
          statusCode = 429
          return NextResponse.json(
            {
              error: 'Rate limit exceeded',
              resetAt: rateLimit.resetAt,
              remaining: rateLimit.remaining,
            },
            { status: 429 }
          )
        }
      }
    }

    // Generate topics using AI
    const result = await generateCompletion({
      systemPrompt: SYSTEM_PROMPTS.topicGenerator,
      userPrompt: buildTopicGeneratorPrompt(category),
      userId: user?.id.toString(),
      toolId: 'topic-generator',
      category,
    })

    // Parse and validate the AI response
    const parsedContent = JSON.parse(result.content)
    const topics = topicApiResponseSchema.parse(parsedContent)

    // Update usage stats if authenticated using optimized function
    if (user) {
      await updateUserUsageStats(user.id.toString(), true)
    }

    const response = NextResponse.json({
      topics,
      metadata: {
        tokensUsed: result.tokensUsed,
        model: result.model,
        processingTime: result.processingTime,
      },
    })

    // Log API request
    const duration = timer.end()
    logAPIRequest({
      method: 'POST',
      path: '/api/tools/generate-topics',
      statusCode,
      duration,
      userId: user?.id.toString(),
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return response
  } catch (error) {
    statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500
    
    // Log API request with error
    const duration = timer.end()
    logAPIRequest({
      method: 'POST',
      path: '/api/tools/generate-topics',
      statusCode,
      duration,
      userAgent: request.headers.get('user-agent') || undefined,
    })
    
    return handleError(error)
  }
}
