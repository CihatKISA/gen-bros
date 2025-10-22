import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, BookmarkCheck, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI Content Topic Generator
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Generate engaging social media content topics powered by AI. 
            Save your favorites and never run out of content ideas.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/topic-generator">
                <Sparkles className="mr-2 h-5 w-5" />
                Try Topic Generator
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <Sparkles className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>AI-Powered</CardTitle>
              <CardDescription>
                Generate unique, engaging content topics using advanced AI technology
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BookmarkCheck className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Save & Organize</CardTitle>
              <CardDescription>
                Save your favorite topics and access them anytime from your dashboard
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Fast & Easy</CardTitle>
              <CardDescription>
                Get instant results with just a category input. No complicated setup required
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to get started?</CardTitle>
              <CardDescription>
                Try the topic generator now or create an account to save your topics
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4 justify-center">
              <Button asChild>
                <Link href="/topic-generator">Start Generating</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
