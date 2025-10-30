import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/src/payload/payload.config'
import { sanitizeSearchQuery } from '@/src/lib/validation/sanitize'
import { handleError } from '@/src/lib/errors/handler'
import { AuthenticationError } from '@/src/lib/errors/AppError'
import { getUserSavedTopics } from '@/src/lib/db'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Check authentication
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      throw new AuthenticationError()
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const toolSlugRaw = searchParams.get('toolSlug')
    const toolSlug = toolSlugRaw ? sanitizeSearchQuery(toolSlugRaw) : undefined
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 100)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)

    // Use optimized query function
    const result = await getUserSavedTopics(user.id.toString(), {
      limit,
      page,
      toolSlug,
    })

    return NextResponse.json(result)
  } catch (error) {
    return handleError(error)
  }
}
