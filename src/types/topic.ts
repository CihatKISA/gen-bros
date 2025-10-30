export interface Topic {
  title: string;
  description: string;
  contentType: string;
  hashtags: string[];
  targetAudience: string;
  engagementHook: string;
}

export interface TopicMetadata {
  tokensUsed: number;
  model: string;
  processingTime?: number;
}

export interface GenerateTopicsResponse {
  topics: Topic[];
  metadata: TopicMetadata;
}
