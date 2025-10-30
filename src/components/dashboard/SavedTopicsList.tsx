'use client';

import { useState, useEffect } from 'react';
import { TopicCard } from './TopicCard';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';
import type { Topic } from '@/src/types/topic';

interface SavedTopic {
  id: string;
  title: string;
  content: Topic;
  tool: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
}

interface SavedTopicsResponse {
  docs: SavedTopic[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface SavedTopicsListProps {
  toolSlug?: string;
}

export function SavedTopicsList({ toolSlug }: SavedTopicsListProps) {
  const [topics, setTopics] = useState<SavedTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopics() {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (toolSlug) {
          params.append('toolSlug', toolSlug);
        }
        params.append('limit', '20');
        params.append('page', '1');

        const response = await fetch(`/api/tools/saved-topics?${params.toString()}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch saved topics');
        }

        const data: SavedTopicsResponse = await response.json();
        setTopics(data.docs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTopics();
  }, [toolSlug]);

  function handleDelete(id: string) {
    setTopics((prev) => prev.filter((topic) => topic.id !== id));
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Saved Topics</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={`skeleton-${i}`} className="h-[300px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No saved topics yet</h3>
        <p className="text-muted-foreground">
          Generate topics and save them to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Saved Topics</h2>
        <div className="text-sm text-muted-foreground">
          {topics.length} {topics.length === 1 ? 'topic' : 'topics'}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
