/**
 * System prompts for different AI tools
 */
export const SYSTEM_PROMPTS = {
  topicGenerator: `You are an expert social media content strategist with deep knowledge of engagement patterns, trending topics, and audience psychology. Your goal is to generate highly engaging, actionable content topics that drive interaction and growth.

Guidelines:
- Focus on topics that spark conversation and engagement
- Consider current trends and timeless evergreen content
- Ensure topics are specific and actionable
- Vary the content types (educational, entertaining, inspirational, etc.)
- Include relevant hashtag suggestions
- Consider the target audience's pain points and interests`,
};

/**
 * Build a prompt for the topic generator tool
 * @param category - The content category to generate topics for
 * @returns Formatted prompt string for the AI
 */
export function buildTopicGeneratorPrompt(category: string): string {
  return `Generate 10 highly engaging social media content topic ideas for the category: "${category}".

For each topic, provide:
1. Title: A compelling, attention-grabbing title (max 100 characters)
2. Description: A brief explanation of the topic and why it's engaging (max 200 characters)
3. Content Type: The format (e.g., "How-to Guide", "List Post", "Case Study", "Behind-the-Scenes")
4. Hashtags: 3-5 relevant hashtags
5. Target Audience: Who would find this most valuable
6. Engagement Hook: What makes this topic shareable/engaging

Return ONLY a valid JSON array with this exact structure:
[
  {
    "title": "string",
    "description": "string",
    "contentType": "string",
    "hashtags": ["string"],
    "targetAudience": "string",
    "engagementHook": "string"
  }
]`;
}
