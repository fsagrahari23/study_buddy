"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Zap, BarChart3, Share2 } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Smart Study Buddy</span>
          </div>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-balance">Your AI-Powered Study Companion</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload PDFs, ask questions, generate flashcards, and track your progress with intelligent spaced repetition.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="text-lg px-8">
              Get Started Free
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <div className="p-6 rounded-lg border border-border bg-card hover:border-primary transition-colors">
            <BookOpen className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">PDF Upload & Chat</h3>
            <p className="text-sm text-muted-foreground">Upload any PDF and ask questions using natural language</p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card hover:border-primary transition-colors">
            <Zap className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Smart Flashcards</h3>
            <p className="text-sm text-muted-foreground">Auto-generate flashcards with spaced repetition</p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card hover:border-primary transition-colors">
            <BarChart3 className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Progress Tracking</h3>
            <p className="text-sm text-muted-foreground">Monitor your strengths and weaknesses</p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card hover:border-primary transition-colors">
            <Share2 className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Share Achievements</h3>
            <p className="text-sm text-muted-foreground">Share your progress on LinkedIn</p>
          </div>
        </div>
      </section>
    </div>
  )
}
