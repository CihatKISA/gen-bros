// Export OpenAI client and configuration
export { openai, DEFAULT_MODEL, MAX_TOKENS, TEMPERATURE } from './openai';

// Export prompt utilities
export { SYSTEM_PROMPTS, buildTopicGeneratorPrompt } from './prompts';

// Export AI service
export {
  generateCompletion,
  parseAIResponse,
  type GenerateOptions,
  type GenerateResult,
} from './service';

// Export rate limiting
export {
  checkRateLimit,
  resetRateLimit,
  type RateLimitConfig,
  type RateLimitResult,
} from './rate-limiter';
