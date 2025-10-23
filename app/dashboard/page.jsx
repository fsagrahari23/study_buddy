"use client"

import { useSelector } from "react-redux"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AIStudyRecommendations } from "@/components/ai-study-recommendations"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { BookOpen, Zap, TrendingUp, Flame } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const user = useSelector((state) => state.auth.user)
  const files = useSelector((state) => state.files.files)
  const flashcards = useSelector((state) => state.flashcards.decks)
  const quizzes = useSelector((state) => state.quizzes.results)

  const progressData = [
    { subject: "Mathematics", score: 85 },
    { subject: "Physics", score: 72 },
    { subject: "Chemistry", score: 88 },
    { subject: "Biology", score: 78 },
    { subject: "History", score: 92 },
  ]

  const studyData = [
    { day: "Mon", hours: 2 },
    { day: "Tue", hours: 3 },
    { day: "Wed", hours: 2.5 },
    { day: "Thu", hours: 4 },
    { day: "Fri", hours: 3.5 },
    { day: "Sat", hours: 5 },
    { day: "Sun", hours: 2 },
  ]

  const totalDueCards = flashcards.reduce((sum, deck) => sum + deck.dueToday, 0)
  const avgScore =
    quizzes.length > 0
      ? Math.round(quizzes.reduce((sum, r) => sum + (r.score / r.totalScore) * 100, 0) / quizzes.length)
      : 0

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header with AI Recommendations */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground">Here's your learning progress overview</p>
          </div>
          <AIStudyRecommendations />
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Files Uploaded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{files.length}</div>
              <p className="text-xs text-muted-foreground mt-1">PDFs ready to study</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Due Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{totalDueCards}</div>
              <p className="text-xs text-muted-foreground mt-1">Flashcards to review</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{avgScore}%</div>
              <p className="text-xs text-muted-foreground mt-1">Quiz performance</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Study Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold">7</div>
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Days in a row</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Study Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Study Hours This Week</CardTitle>
              <CardDescription>Daily study time tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={studyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subject Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>Strength and weakness analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={progressData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Upload PDF
              </CardTitle>
              <CardDescription>Add a new study material</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/study">
                <Button className="w-full">Upload Now</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Study Flashcards
              </CardTitle>
              <CardDescription>Review {totalDueCards} due cards</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/flashcards">
                <Button className="w-full">Start Review</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Take Quiz
              </CardTitle>
              <CardDescription>Test your knowledge</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/quizzes">
                <Button className="w-full">Start Quiz</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest study sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Completed flashcard review", time: "2 hours ago", icon: Zap, color: "text-purple-600" },
                {
                  action: "Scored 85% on Algebra Quiz",
                  time: "5 hours ago",
                  icon: TrendingUp,
                  color: "text-green-600",
                },
                { action: "Uploaded Physics notes", time: "1 day ago", icon: BookOpen, color: "text-blue-600" },
                {
                  action: "Generated 12 new flashcards with AI",
                  time: "2 days ago",
                  icon: Zap,
                  color: "text-purple-600",
                },
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={idx} className="flex items-center gap-4 pb-4 border-b border-border last:border-0">
                    <div className={`p-2 rounded-lg bg-primary/10`}>
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.action}</p>
                      <p className="text-sm text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
