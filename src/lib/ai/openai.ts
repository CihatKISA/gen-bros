import OpenAI from 'openai';

// Validate OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not defined');
}

if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
  throw new Error('OPENAI_API_KEY must start with "sk-"');
}

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Default configuration settings
export const DEFAULT_MODEL = 'gpt-4o-mini';
export const MAX_TOKENS = 2000;
export const TEMPERATURE = 0.7;
