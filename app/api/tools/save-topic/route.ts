import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/src/payload/payload.config'
import { saveTopicSchema } from '@/src/lib/validation/schemas'
import { sanitizeInput, sanitizeJson } from '@/src/lib/validation/sanitize'
import { handleError } from '@/src/lib/errors/handler'
import { AuthenticationError } from '@/src/lib/errors/AppError'
import { getToolBySlug, isTopicSaved } from '@/src/lib/db'
import { invalidateCache } from '@/src/lib/cache'
import { logAPIRequest, logUserActivity } from '@/src/lib/logger'
import { createTimer } from '@/src/lib/performance/monitoring'

export async function POST(request: NextRequest) {
  const timer = createTimer('api_save_topic')
  let statusCode = 201
  
  try {
    const payload = await getPayload({ config })
    
    // Check authentication
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      throw new AuthenticationError()
    }

    // Parse and validate request body
    const body = await request.json()
    const validated = saveTopicSchema.parse(body)
    
    // Sanitize inputs
    const data = {
      toolId: sanitizeInput(validated.toolId, 100),
      title: sanitizeInput(validated.title, 200),
      content: sanitizeJson(validated.content),
      input: sanitizeJson(validated.input),
      categoryId: validated.categoryId ? sanitizeInput(validated.categoryId, 100) : undefined,
      metadata: validated.metadata,
    }

    // Find the tool by slug or ID using optimized query
    let toolId: string | number = data.toolId
    
    // If toolId is a slug (e.g., 'topic-generator'), find the actual ID
    if (!toolId.match(/^[0-9a-fA-F]{24}$/)) {
      const toolModule = await getToolBySlug(data.toolId)

      if (!toolModule) {
        statusCode = 404
        return NextResponse.json(
          { error: 'Tool not found' },
          { status: 404 }
        )
      }

      toolId = toolModule.id
    }

    // Check for duplicate saved topics using optimized query
    const alreadySaved = await isTopicSaved(user.id.toString(), toolId.toString(), data.title)

    if (alreadySaved) {
      statusCode = 409
      return NextResponse.json(
        { error: 'Topic already saved' },
        { status: 409 }
      )
    }

    // Create saved topic record
    const savedTopic = await payload.create({
      collection: 'saved-topics',
      data: {
        user: user.id,
        tool: toolId,
        category: data.categoryId,
        title: data.title,
        content: data.content,
        input: data.input,
        metadata: data.metadata,
      },
    })

    // Log user activity
    logUserActivity({
      userId: user.id.toString(),
      action: 'save_topic',
      resource: `topic:${savedTopic.id}`,
      metadata: {
        toolId: toolId.toString(),
        title: data.title,
      },
    })

    // Invalidate user's saved topics cache
    await invalidateCache(`user:${user.id}:topics*`)

    const response = NextResponse.json(
      { savedTopic },
      { status: 201 }
    )

    // Log API request
    const duration = timer.end()
    logAPIRequest({
      method: 'POST',
      path: '/api/tools/save-topic',
      statusCode,
      duration,
      userId: user.id.toString(),
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return response
  } catch (error) {
    statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500
    
    // Log API request with error
    const duration = timer.end()
    logAPIRequest({
      method: 'POST',
      path: '/api/tools/save-topic',
      statusCode,
      duration,
      userAgent: request.headers.get('user-agent') || undefined,
    })
    
    return handleError(error)
  }
}
