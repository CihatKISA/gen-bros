import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, BookmarkCheck, Zap, TrendingUp, Users, Clock } from 'lucide-react'

export default function Home() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <Badge variant="secondary" className="mb-4">
            Powered by OpenAI GPT-4
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Never Run Out of Content Ideas
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Generate engaging social media content topics in seconds. 
            AI-powered suggestions tailored to your niche, complete with hashtags and engagement hooks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/topic-generator">
                <Sparkles className="mr-2 h-5 w-5" />
                Try Topic Generator
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register">Create Free Account</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Free to try • Save topics with an account
          </p>
        </section>

        {/* Features Grid */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Create Engaging Content
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <Sparkles className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>AI-Powered Generation</CardTitle>
                <CardDescription>
                  Advanced AI analyzes trends and generates unique, engaging content topics tailored to your category
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BookmarkCheck className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Save & Organize</CardTitle>
                <CardDescription>
                  Save your favorite topics to your personal dashboard and access them anytime, anywhere
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Instant Results</CardTitle>
                <CardDescription>
                  Get 10 unique topic ideas in seconds. No complicated setup or learning curve required
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Engagement Focused</CardTitle>
                <CardDescription>
                  Each topic includes engagement hooks and strategies to maximize your content's reach
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Target Audience Insights</CardTitle>
                <CardDescription>
                  Understand who your content resonates with and tailor your message accordingly
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Save Time</CardTitle>
                <CardDescription>
                  Stop spending hours brainstorming. Generate a month's worth of content ideas in minutes
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-muted/50 -mx-4 px-4 rounded-lg">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="font-semibold mb-2">Enter Your Category</h3>
                <p className="text-sm text-muted-foreground">
                  Type in your content niche or category (e.g., "Digital Marketing", "Fitness")
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="font-semibold mb-2">AI Generates Topics</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes trends and creates 10 unique, engaging topic ideas with details
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="font-semibold mb-2">Save & Create</h3>
                <p className="text-sm text-muted-foreground">
                  Save your favorites and start creating content that resonates with your audience
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-center">
          <Card className="max-w-2xl mx-auto border-primary/20">
            <CardHeader>
              <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
              <CardDescription className="text-base">
                Join content creators who are using AI to generate engaging topics. 
                Try it free - no credit card required.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/topic-generator">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Generating Topics
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/register">Create Free Account</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Guest User Notice */}
        <section className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}
