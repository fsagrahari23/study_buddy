"use client"
import { useDispatch, useSelector } from "react-redux"
import { generateRoadmap, clearError } from "@/lib/slices/roadmapSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, AlertCircle } from "lucide-react"

export function RoadmapGenerator() {
  const dispatch = useDispatch()
  const { isGenerating, error } = useSelector((state) => state.roadmap)
  const { stats } = useSelector((state) => state.activity)

  const handleGenerateRoadmap = async () => {
    dispatch(generateRoadmap())
  }

  const handleClearError = () => {
    dispatch(clearError())
  }

  return (
    <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-600/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          AI Roadmap Generator
        </CardTitle>
        <CardDescription>Generate a personalized learning roadmap based on your activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="ghost" size="sm" onClick={handleClearError} className="ml-auto">
              ×
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Study Hours</p>
            <p className="font-semibold">{stats.totalStudyHours.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-muted-foreground">Avg Score</p>
            <p className="font-semibold">{stats.averageScore.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Quizzes Taken</p>
            <p className="font-semibold">{stats.quizzesTaken}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Notes Viewed</p>
            <p className="font-semibold">{stats.notesViewed}</p>
          </div>
        </div>

        <Button onClick={handleGenerateRoadmap} disabled={isGenerating} className="w-full">
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Roadmap...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Roadmap
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}


