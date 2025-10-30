'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, Loader2 } from 'lucide-react';
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

interface TopicCardProps {
  topic: SavedTopic;
  onDelete: (id: string) => void;
}

export function TopicCard({ topic, onDelete }: TopicCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/tools/saved-topics/${topic.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete topic');
      }

      onDelete(topic.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete topic. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  }

  const formattedDate = new Date(topic.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <>
      <Card className="relative">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{topic.tool.name}</Badge>
                <span className="text-xs text-muted-foreground">{formattedDate}</span>
              </div>
              <CardTitle className="text-lg">{topic.title}</CardTitle>
              <CardDescription className="mt-1">
                {topic.content.description}
              </CardDescription>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowDeleteDialog(true)}
              className="shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-sm font-medium">Type:</span>
            <Badge variant="outline" className="ml-2">
              {topic.content.contentType}
            </Badge>
          </div>

          <div>
            <span className="text-sm font-medium">Target Audience:</span>
            <p className="text-sm text-muted-foreground mt-1">
              {topic.content.targetAudience}
            </p>
          </div>

          <div>
            <span className="text-sm font-medium">Engagement Hook:</span>
            <p className="text-sm text-muted-foreground mt-1">
              {topic.content.engagementHook}
            </p>
          </div>

          <div className="flex flex-wrap gap-1">
            {topic.content.hashtags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Topic</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{topic.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
