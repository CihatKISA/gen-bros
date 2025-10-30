'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { TopicGeneratorForm } from '@/src/components/tools/TopicGenerator/TopicGeneratorForm';
import { Skeleton } from '@/components/ui/skeleton';
import type { Topic, TopicMetadata } from '@/src/types/topic';

// Lazy load TopicResults component since it's only shown after generation
const TopicResults = dynamic(
  () => import('@/src/components/tools/TopicGenerator/TopicResults').then(mod => ({ default: mod.TopicResults })),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    ),
  }
);

interface GenerateResult {
  topics: Topic[];
  metadata: TopicMetadata;
  category: string;
}

export default function TopicGeneratorPage() {
  const [result, setResult] = useState<GenerateResult | null>(null);

  function handleGenerate(generatedTopics: Topic[], generatedMetadata: TopicMetadata, category: string) {
    setResult({
      topics: generatedTopics,
      metadata: generatedMetadata,
      category,
    });
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Topic Generator</h1>
          <p className="text-muted-foreground">
            Generate engaging social media content topics powered by AI
          </p>
        </div>

        <TopicGeneratorForm onGenerate={handleGenerate} />
      </div>

      {result && result.topics.length > 0 && (
        <div className="mt-12">
          <TopicResults 
            topics={result.topics} 
            category={result.category} 
            metadata={result.metadata} 
          />
        </div>
      )}
    </div>
  );
}
