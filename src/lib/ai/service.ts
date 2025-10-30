import { openai, DEFAULT_MODEL, MAX_TOKENS, TEMPERATURE } from './openai';
import { logAIRequest, logError } from '../logger';
import { monitorAIRequest } from '../performance/monitoring';

/**
 * Options for generating AI completions
 */
export interface GenerateOptions {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  userId?: string;
  toolId?: string;
  category?: string;
}

/**
 * Result from AI generation
 */
export interface GenerateResult {
  content: string;
  tokensUsed: number;
  model: string;
  processingTime: number;
}

/**
 * Generate a completion using OpenAI API with retry logic
 * @param options - Configuration for the AI generation
 * @returns Generated content with metadata
 */
export async function generateCompletion(
  options: GenerateOptions
): Promise<GenerateResult> {
  const startTime = Date.now();
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: options.model || DEFAULT_MODEL,
        messages: [
          { role: 'system', content: options.systemPrompt },
          { role: 'user', content: options.userPrompt },
        ],
        max_tokens: options.maxTokens || MAX_TOKENS,
        temperature: options.temperature ?? TEMPERATURE,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI API');
      }

      // Validate that the response is valid JSON
      try {
        JSON.parse(content);
      } catch {
        throw new Error('Invalid JSON response from OpenAI API');
      }

      const tokensUsed = response.usage?.total_tokens || 0;
      const processingTime = Date.now() - startTime;

      // Log successful AI request
      logAIRequest({
        userId: options.userId,
        toolId: options.toolId || 'unknown',
        category: options.category,
        tokensUsed,
        processingTime,
        model: response.model,
        success: true,
      });

      return {
        content,
        tokensUsed,
        model: response.model,
        processingTime,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Log error
      logError(lastError, {
        context: 'ai_generation',
        attempt,
        userId: options.userId,
        toolId: options.toolId,
      });
      
      // Don't retry on validation errors or non-retryable errors
      if (
        error instanceof Error &&
        (error.message.includes('Invalid JSON') ||
          error.message.includes('API key'))
      ) {
        // Log failed AI request
        logAIRequest({
          userId: options.userId,
          toolId: options.toolId || 'unknown',
          category: options.category,
          tokensUsed: 0,
          processingTime: Date.now() - startTime,
          model: options.model || DEFAULT_MODEL,
          success: false,
          error: lastError.message,
        });
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        console.warn(`Retry attempt ${attempt} after ${delay}ms`);
      }
    }
  }

  // All retries failed - log final failure
  if (lastError) {
    logAIRequest({
      userId: options.userId,
      toolId: options.toolId || 'unknown',
      category: options.category,
      tokensUsed: 0,
      processingTime: Date.now() - startTime,
      model: options.model || DEFAULT_MODEL,
      success: false,
      error: lastError.message,
    });
  }

  console.error('OpenAI API error after retries:', lastError);
  throw new Error(
    'Failed to generate content. Please try again later.'
  );
}

/**
 * Parse and validate AI response
 * @param content - Raw content from AI
 * @returns Parsed and validated data
 */
export function parseAIResponse<T>(content: string): T {
  try {
    const parsed = JSON.parse(content);
    return parsed as T;
  } catch {
    throw new Error('Failed to parse AI response');
  }
}
