import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { loginSchema } from '@/src/lib/validation/schemas'
import { sanitizeEmail } from '@/src/lib/validation/sanitize'
import { handleError } from '@/src/lib/errors/handler'
import { z } from 'zod'
import config from '@/src/payload/payload.config'
import { logAuth, logAPIRequest } from '@/src/lib/logger'
import { createTimer } from '@/src/lib/performance/monitoring'

export async function POST(request: NextRequest) {
  const timer = createTimer('api_auth_login')
  let statusCode = 200
  let email: string | undefined
  let userId: string | undefined
  
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Sanitize email input
    email = sanitizeEmail(validatedData.email)

    const payload = await getPayload({ config })

    // Attempt to log in the user
    const result = await payload.login({
      collection: 'users',
      data: {
        email,
        password: validatedData.password,
      },
    })

    if (!result.token) {
      throw new Error('Login failed - no token received')
    }

    userId = result.user.id.toString()

    // Log successful authentication
    logAuth({
      action: 'login',
      userId,
      email,
      success: true,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
    })

    // Set the token as an HTTP-only cookie
    const response = NextResponse.json(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
        },
      },
      { status: 200 }
    )

    response.cookies.set('payload-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2, // 2 hours
      path: '/',
    })

    // Log API request
    const duration = timer.end()
    logAPIRequest({
      method: 'POST',
      path: '/api/auth/login',
      statusCode,
      duration,
      userId,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return response
  } catch (error) {
    statusCode = error instanceof z.ZodError ? 400 : 401
    
    // Log failed authentication
    logAuth({
      action: 'login',
      email,
      success: false,
      reason: error instanceof Error ? error.message : 'Unknown error',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
    })
    
    // Log API request with error
    const duration = timer.end()
    logAPIRequest({
      method: 'POST',
      path: '/api/auth/login',
      statusCode,
      duration,
      userAgent: request.headers.get('user-agent') || undefined,
    })
    
    // Don't reveal whether email or password was incorrect for security
    if (error instanceof z.ZodError) {
      return handleError(error)
    }
    
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Invalid email or password', code: 'AUTHENTICATION_ERROR' },
      { status: 401 }
    )
  }
}
