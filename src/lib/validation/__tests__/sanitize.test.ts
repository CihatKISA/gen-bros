import { describe, it, expect } from 'vitest'
import {
  sanitizeInput,
  stripHtml,
  sanitizeCategory,
  sanitizeEmail,
  sanitizeSearchQuery,
  sanitizeJson,
} from '../sanitize'

describe('sanitizeInput', () => {
  it('should remove angle brackets', () => {
    const input = 'Hello <script>alert("xss")</script> World'
    const result = sanitizeInput(input)
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
  })

  it('should remove curly braces', () => {
    const input = 'Hello {dangerous} World'
    const result = sanitizeInput(input)
    expect(result).not.toContain('{')
    expect(result).not.toContain('}')
  })

  it('should trim whitespace', () => {
    const input = '  Hello World  '
    const result = sanitizeInput(input)
    expect(result).toBe('Hello World')
  })

  it('should limit length to default 1000 characters', () => {
    const input = 'a'.repeat(1500)
    const result = sanitizeInput(input)
    expect(result.length).toBe(1000)
  })

  it('should limit length to custom maxLength', () => {
    const input = 'a'.repeat(500)
    const result = sanitizeInput(input, 100)
    expect(result.length).toBe(100)
  })

  it('should handle empty string', () => {
    const result = sanitizeInput('')
    expect(result).toBe('')
  })
})

describe('stripHtml', () => {
  it('should remove all HTML tags', () => {
    const input = '<p>Hello <strong>World</strong></p>'
    const result = stripHtml(input)
    expect(result).toBe('Hello World')
  })

  it('should handle self-closing tags', () => {
    const input = 'Hello<br/>World'
    const result = stripHtml(input)
    expect(result).toBe('HelloWorld')
  })

  it('should handle nested tags', () => {
    const input = '<div><span><a href="#">Link</a></span></div>'
    const result = stripHtml(input)
    expect(result).toBe('Link')
  })

  it('should handle text without HTML', () => {
    const input = 'Plain text'
    const result = stripHtml(input)
    expect(result).toBe('Plain text')
  })
})

describe('sanitizeCategory', () => {
  it('should remove dangerous characters', () => {
    const input = 'Digital <Marketing>'
    const result = sanitizeCategory(input)
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
  })

  it('should trim whitespace', () => {
    const input = '  Technology  '
    const result = sanitizeCategory(input)
    expect(result).toBe('Technology')
  })

  it('should limit to 100 characters', () => {
    const input = 'a'.repeat(150)
    const result = sanitizeCategory(input)
    expect(result.length).toBe(100)
  })

  it('should preserve ampersands', () => {
    const input = 'Health & Fitness'
    const result = sanitizeCategory(input)
    expect(result).toBe('Health & Fitness')
  })
})

describe('sanitizeEmail', () => {
  it('should convert to lowercase', () => {
    const input = 'Test@Example.COM'
    const result = sanitizeEmail(input)
    expect(result).toBe('test@example.com')
  })

  it('should trim whitespace', () => {
    const input = '  test@example.com  '
    const result = sanitizeEmail(input)
    expect(result).toBe('test@example.com')
  })

  it('should limit to 255 characters', () => {
    const input = 'a'.repeat(300) + '@example.com'
    const result = sanitizeEmail(input)
    expect(result.length).toBe(255)
  })
})

describe('sanitizeSearchQuery', () => {
  it('should remove dangerous characters', () => {
    const input = 'search <term>'
    const result = sanitizeSearchQuery(input)
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
  })

  it('should remove special characters except hyphens', () => {
    const input = 'search-term!@#$%'
    const result = sanitizeSearchQuery(input)
    expect(result).toContain('search-term')
    expect(result).not.toContain('!')
    expect(result).not.toContain('@')
  })

  it('should preserve spaces and hyphens', () => {
    const input = 'multi word search-term'
    const result = sanitizeSearchQuery(input)
    expect(result).toBe('multi word search-term')
  })

  it('should limit to 200 characters', () => {
    const input = 'a'.repeat(300)
    const result = sanitizeSearchQuery(input)
    expect(result.length).toBe(200)
  })

  it('should trim whitespace', () => {
    const input = '  search query  '
    const result = sanitizeSearchQuery(input)
    expect(result).toBe('search query')
  })
})

describe('sanitizeJson', () => {
  it('should return object as-is', () => {
    const input = { key: 'value' }
    const result = sanitizeJson(input)
    expect(result).toEqual(input)
  })

  it('should parse valid JSON string', () => {
    const input = '{"key":"value"}'
    const result = sanitizeJson(input)
    expect(result).toEqual({ key: 'value' })
  })

  it('should return null for invalid JSON string', () => {
    const input = '{invalid json}'
    const result = sanitizeJson(input)
    expect(result).toBeNull()
  })

  it('should handle arrays', () => {
    const input = [1, 2, 3]
    const result = sanitizeJson(input)
    expect(result).toEqual(input)
  })

  it('should return null for null input', () => {
    const input = null
    const result = sanitizeJson(input)
    expect(result).toBeNull()
  })

  it('should return primitive values as-is', () => {
    expect(sanitizeJson(123)).toBe(123)
    expect(sanitizeJson(true)).toBe(true)
  })
})
