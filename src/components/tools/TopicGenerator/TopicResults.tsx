'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SaveTopicButton } from './SaveTopicButton';
import type { Topic, TopicMetadata } from '@/src/types/topic';

interface TopicResultsProps {
  topics: Topic[];
  category: string;
  metadata: TopicMetadata;
}

export function TopicResults({ topics, category, metadata }: TopicResultsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Generated Topics</h2>
        <div className="text-sm text-muted-foreground">
          {topics.length} topics • {metadata.tokensUsed} tokens
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {topics.map((topic) => (
          <Card key={`${topic.title}-${topic.contentType}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{topic.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {topic.description}
                  </CardDescription>
                </div>
                <SaveTopicButton
                  topic={topic}
                  category={category}
                  metadata={metadata}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium">Type:</span>
                <Badge variant="secondary" className="ml-2">
                  {topic.contentType}
                </Badge>
              </div>

              <div>
                <span className="text-sm font-medium">Target Audience:</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {topic.targetAudience}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium">Engagement Hook:</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {topic.engagementHook}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                {topic.hashtags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
