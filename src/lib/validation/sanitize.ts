/**
 * Sanitization utilities for user inputs
 * Protects against XSS and injection attacks
 */

/**
 * Sanitize plain text input by removing potentially dangerous characters
 * and limiting length
 */
export function sanitizeInput(input: string, maxLength = 1000): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets to prevent HTML injection
    .replace(/[{}]/g, '') // Remove curly braces
    .slice(0, maxLength); // Limit length
}

/**
 * Sanitize HTML content by stripping all HTML tags
 * Use this for inputs that should be plain text only
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize category input specifically
 */
export function sanitizeCategory(category: string): string {
  return category
    .trim()
    .replace(/[<>{}]/g, '')
    .slice(0, 100);
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  return email
    .trim()
    .toLowerCase()
    .slice(0, 255);
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>{}]/g, '')
    .replace(/[^\w\s-]/g, '') // Only allow alphanumeric, spaces, and hyphens
    .slice(0, 200);
}

/**
 * Sanitize JSON input by ensuring it's valid JSON
 */
export function sanitizeJson(input: any): any {
  try {
    // If it's already an object, return it
    if (typeof input === 'object' && input !== null) {
      return input;
    }
    
    // If it's a string, try to parse it
    if (typeof input === 'string') {
      return JSON.parse(input);
    }
    
    return input;
  } catch {
    return null;
  }
}
