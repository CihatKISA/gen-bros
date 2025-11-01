import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { z } from 'zod'

// Schema for GET request
const getLlmKeysSchema = z.object({})

// Schema for POST request
const createLlmKeySchema = z.object({
  name: z.string().min(1),
  apiKey: z.string().min(1),
  provider: z.string().min(1),
  isEnabled: z.boolean(),
})

// Schema for PUT request
const updateLlmKeySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  apiKey: z.string().min(1),
  provider: z.string().min(1),
  isEnabled: z.boolean(),
})

// Schema for DELETE request
const deleteLlmKeySchema = z.object({
  id: z.string().min(1),
})

export async function GET(request: NextRequest) {
  const payload = await getPayload()
  const { user } = await payload.auth(request)

  if (user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const keys = await payload.find({
    collection: 'llm-keys',
  })

  return NextResponse.json(keys)
}

export async function POST(request: NextRequest) {
  const payload = await getPayload()
  const { user } = await payload.auth(request)

  if (user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, apiKey, provider, isEnabled } = createLlmKeySchema.parse(body)

  const newKey = await payload.create({
    collection: 'llm-keys',
    data: {
      name,
      apiKey,
      provider,
      isEnabled,
    },
  })

  return NextResponse.json(newKey)
}

export async function PUT(request: NextRequest) {
  const payload = await getPayload()
  const { user } = await payload.auth(request)

  if (user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, name, apiKey, provider, isEnabled } = updateLlmKeySchema.parse(body)

  const updatedKey = await payload.update({
    collection: 'llm-keys',
    id,
    data: {
      name,
      apiKey,
      provider,
      isEnabled,
    },
  })

  return NextResponse.json(updatedKey)
}

export async function DELETE(request: NextRequest) {
  const payload = await getPayload()
  const { user } = await payload.auth(request)

  if (user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id } = deleteLlmKeySchema.parse(body)

  await payload.delete({
    collection: 'llm-keys',
    id,
  })

  return NextResponse.json({ success: true })
}
