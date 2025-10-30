'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/src/lib/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Topic, TopicMetadata } from '@/src/types/topic';
import { useAnalytics } from '@/src/lib/analytics';

interface SaveTopicButtonProps {
  topic: Topic;
  category: string;
  metadata: TopicMetadata;
}

export function SaveTopicButton({ topic, category, metadata }: SaveTopicButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { trackTopicSave, trackError } = useAnalytics();

  async function handleSave() {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/tools/save-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'topic-generator',
          title: topic.title,
          content: topic,
          input: { category },
          metadata,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save topic');
      }

      // Track successful save
      trackTopicSave({
        toolId: 'topic-generator',
        category,
        success: true,
      });

      setIsSaved(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save topic';
      
      // Track failed save
      trackTopicSave({
        toolId: 'topic-generator',
        category,
        success: false,
      });
      
      trackError({
        error: errorMessage,
        context: 'save_topic',
      });
      
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        onClick={handleSave}
        disabled={isSaving || isSaved || isLoading}
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isSaved ? (
          <BookmarkCheck className="h-4 w-4 text-primary" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </Button>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in to save topics</DialogTitle>
            <DialogDescription>
              Create an account or sign in to save your generated topics and access them later.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/register')}
            >
              Create Account
            </Button>
            <Button
              className="flex-1"
              onClick={() => router.push('/login')}
            >
              Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
