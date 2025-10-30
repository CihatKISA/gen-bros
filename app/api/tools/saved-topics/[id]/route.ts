import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/src/payload/payload.config'
import { sanitizeInput } from '@/src/lib/validation/sanitize'
import { handleError } from '@/src/lib/errors/handler'
import { AuthenticationError } from '@/src/lib/errors/AppError'
import { deleteSavedTopic } from '@/src/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config })
    
    // Check authentication
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      throw new AuthenticationError()
    }

    const { id: rawId } = await params
    const id = sanitizeInput(rawId, 100)

    // Use optimized delete function with ownership check
    const deleted = await deleteSavedTopic(id, user.id.toString())

    if (!deleted) {
      return NextResponse.json(
        { error: 'Topic not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Topic deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    return handleError(error)
  }
}
