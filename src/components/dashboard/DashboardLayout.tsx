'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@/src/lib/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import LlmKeysPage from '@/app/dashboard/admin/llm-keys/page';

// Lazy load SavedTopicsList since it fetches data and renders many components
const SavedTopicsList = dynamic(
  () => import('./SavedTopicsList').then(mod => ({ default: mod.SavedTopicsList })),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    ),
  }
);

export function DashboardLayout() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user?.email}
        </p>
      </div>

      <Tabs defaultValue="topic-generator" className="space-y-6">
        <TabsList>
          <TabsTrigger value="topic-generator">Topic Generator</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          {user?.role === 'admin' && (
            <TabsTrigger value="admin-llm-keys">LLM Keys</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="topic-generator" className="space-y-4">
          <SavedTopicsList toolSlug="topic-generator" />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="rounded-lg border p-8 text-center text-muted-foreground">
            Settings coming soon
          </div>
        </TabsContent>

        {user?.role === 'admin' && (
          <TabsContent value="admin-llm-keys" className="space-y-4">
            <LlmKeysPage />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
