'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import type { Topic, TopicMetadata } from '@/src/types/topic';
import { useAnalytics } from '@/src/lib/analytics';

const formSchema = z.object({
  category: z.string().min(1, 'Category is required').max(100),
});

interface TopicGeneratorFormProps {
  onGenerate: (topics: Topic[], metadata: TopicMetadata, category: string) => void;
}

export function TopicGeneratorForm({ onGenerate }: TopicGeneratorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackTopicGeneration, trackError } = useAnalytics();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/tools/generate-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate topics');
      }

      const { topics, metadata } = await response.json();
      const duration = Date.now() - startTime;
      
      // Track successful generation
      trackTopicGeneration({
        category: values.category,
        success: true,
        tokensUsed: metadata.tokensUsed,
        duration,
      });
      
      onGenerate(topics, metadata, values.category);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      const duration = Date.now() - startTime;
      
      // Track failed generation
      trackTopicGeneration({
        category: values.category,
        success: false,
        duration,
        error: errorMessage,
      });
      
      trackError({
        error: errorMessage,
        context: 'topic_generation',
      });
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content Category</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Digital Marketing, Fitness, Technology"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Topics...
            </>
          ) : (
            'Generate Topics'
          )}
        </Button>
      </form>
    </Form>
  );
}
