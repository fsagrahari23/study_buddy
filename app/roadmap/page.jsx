"use client"
import { useSelector } from "react-redux"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RoadmapGenerator } from "@/components/roadmap-generator"
import { RoadmapDisplay } from "@/components/roadmap-display"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function RoadmapPage() {
  const { roadmap, isGenerating } = useSelector((state) => state.roadmap)
  const { stats } = useSelector((state) => state.activity)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Learning Roadmap</h1>
          <p className="text-muted-foreground">
            AI-powered personalized learning path based on your activity and performance
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <RoadmapGenerator />
          </div>

          <div className="lg:col-span-2">
            {isGenerating ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Analyzing your activity...</p>
                  </div>
                </CardContent>
              </Card>
            ) : roadmap ? (
              <RoadmapDisplay />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center space-y-2">
                    <p className="text-muted-foreground">Generate your first roadmap to get started</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Your Activity Summary</CardTitle>
            <CardDescription>Overview of your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm text-muted-foreground">Total Study Hours</p>
                <p className="text-2xl font-bold">{stats.totalStudyHours.toFixed(1)}h</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <p className="text-sm text-muted-foreground">Notes Viewed</p>
                <p className="text-2xl font-bold">{stats.notesViewed}</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
                <p className="text-sm text-muted-foreground">Flashcards Reviewed</p>
                <p className="text-2xl font-bold">{stats.flashcardsReviewed}</p>
              </div>
              <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10">
                <p className="text-sm text-muted-foreground">Quizzes Taken</p>
                <p className="text-2xl font-bold">{stats.quizzesTaken}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
