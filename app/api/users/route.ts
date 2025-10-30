import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { registerSchema } from '@/src/lib/validation/schemas'
import { sanitizeEmail, sanitizeInput } from '@/src/lib/validation/sanitize'
import { handleError } from '@/src/lib/errors/handler'
import { getPayloadClient } from '@/src/lib/payload'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Sanitize inputs
    const email = sanitizeEmail(validatedData.email)
    const firstName = validatedData.firstName ? sanitizeInput(validatedData.firstName, 100) : undefined
    const lastName = validatedData.lastName ? sanitizeInput(validatedData.lastName, 100) : undefined

    const payload = await getPayloadClient()

    // Check if user already exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    })

    if (existingUsers.docs.length > 0) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    // Create user
    const user = await payload.create({
      collection: 'users',
      data: {
        email,
        password: validatedData.password,
        firstName,
        lastName,
        role: 'user',
      },
    })

    // Log the user in by creating a session
    const loginResult = await payload.login({
      collection: 'users',
      data: {
        email,
        password: validatedData.password,
      },
    })

    if (!loginResult.token) {
      throw new Error('Registration succeeded but login failed')
    }

    // Set the token as an HTTP-only cookie
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 201 }
    )

    response.cookies.set('payload-token', loginResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2, // 2 hours
      path: '/',
    })

    return response
  } catch (error) {
    return handleError(error)
  }
}
