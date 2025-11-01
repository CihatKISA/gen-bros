import OpenAI from 'openai'
import { getPayload } from 'payload'

// Async function to get the OpenAI client
export async function getOpenAIClient(): Promise<OpenAI> {
  const payload = await getPayload()

  // Fetch the most recent enabled OpenAI key from the database
  const result = await payload.find({
    collection: 'llm-keys',
    where: {
      provider: {
        equals: 'openai',
      },
      isEnabled: {
        equals: true,
      },
    },
    sort: '-createdAt',
    limit: 1,
  })

  if (result.docs.length === 0) {
    throw new Error('No active OpenAI API key found in the database.')
  }

  const apiKey = result.docs[0].apiKey

  if (!apiKey || !apiKey.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key found in the database.')
  }

  return new OpenAI({
    apiKey,
  })
}

// Default configuration settings
export const DEFAULT_MODEL = 'gpt-4o-mini'
export const MAX_TOKENS = 2000
export const TEMPERATURE = 0.7
