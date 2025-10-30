import { getPayload, type Payload } from 'payload'
import config from '@/src/payload/payload.config'

let cachedPayload: Payload | null = null

/**
 * Get Payload instance (singleton pattern)
 * This prevents multiple initializations that cause Drizzle migration prompts
 */
export async function getPayloadClient(): Promise<Payload> {
  if (cachedPayload) {
    return cachedPayload
  }

  try {
    cachedPayload = await getPayload({ config })
    return cachedPayload
  } catch (error) {
    console.error('Failed to initialize Payload:', error)
    throw error
  }
}

/**
 * Reset the cached Payload instance (for testing or development)
 */
export function resetPayloadClient(): void {
  cachedPayload = null
}