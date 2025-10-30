import { z } from 'zod';
import { envSchema } from './schemas';

/**
 * Validate environment variables on application startup
 * Throws an error if required variables are missing or invalid
 */
export function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(err => {
        return `${err.path.join('.')}: ${err.message}`;
      });
      
      console.error('❌ Environment validation failed:');
      console.error(missingVars.join('\n'));
      
      throw new Error(
        `Missing or invalid environment variables:\n${missingVars.join('\n')}`
      );
    }
    throw error;
  }
}

/**
 * Get validated environment variables
 * Use this instead of process.env for type safety
 * Only call this after ensuring environment is loaded
 */
let _env: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (!_env) {
    _env = validateEnv();
  }
  return _env;
}
