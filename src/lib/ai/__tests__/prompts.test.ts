import { describe, it, expect } from 'vitest'
import { buildTopicGeneratorPrompt, SYSTEM_PROMPTS } from '../prompts'

describe('buildTopicGeneratorPrompt', () => {
  it('should include the category in the prompt', () => {
    const category = 'Digital Marketing'
    const prompt = buildTopicGeneratorPrompt(category)
    
    expect(prompt).toContain(category)
    expect(prompt).toContain('"Digital Marketing"')
  })

  it('should request JSON format', () => {
    const prompt = buildTopicGeneratorPrompt('Fitness')
    
    expect(prompt).toContain('JSON')
    expect(prompt).toContain('array')
  })

  it('should specify required fields', () => {
    const prompt = buildTopicGeneratorPrompt('Technology')
    
    expect(prompt).toContain('title')
    expect(prompt).toContain('description')
    expect(prompt).toContain('contentType')
    expect(prompt).toContain('hashtags')
    expect(prompt).toContain('targetAudience')
    expect(prompt).toContain('engagementHook')
  })

  it('should request 10 topics', () => {
    const prompt = buildTopicGeneratorPrompt('Business')
    
    expect(prompt).toContain('10')
  })

  it('should handle special characters in category', () => {
    const category = 'Health & Fitness'
    const prompt = buildTopicGeneratorPrompt(category)
    
    expect(prompt).toContain('Health & Fitness')
  })
})

describe('SYSTEM_PROMPTS', () => {
  it('should have topicGenerator prompt', () => {
    expect(SYSTEM_PROMPTS.topicGenerator).toBeDefined()
    expect(typeof SYSTEM_PROMPTS.topicGenerator).toBe('string')
    expect(SYSTEM_PROMPTS.topicGenerator.length).toBeGreaterThan(0)
  })

  it('should include key guidelines', () => {
    const prompt = SYSTEM_PROMPTS.topicGenerator
    
    expect(prompt).toContain('engagement')
    expect(prompt).toContain('content strategist')
  })
})
