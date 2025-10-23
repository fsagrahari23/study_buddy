"use client"
import { useDispatch, useSelector } from "react-redux"
import { generateRoadmapStart, generateRoadmapSuccess } from "@/lib/slices/roadmapSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, AlertCircle } from "lucide-react"

export function RoadmapGenerator() {
  const dispatch = useDispatch()
  const { isGenerating, error } = useSelector((state) => state.roadmap)
  const { stats } = useSelector((state) => state.activity)

  const handleGenerateRoadmap = async () => {
    dispatch(generateRoadmapStart())

    // Simulate AI generation with sample data
    setTimeout(() => {
      const roadmapData = generateAIRoadmap(stats)
      dispatch(generateRoadmapSuccess(roadmapData))
    }, 2000)
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

function generateAIRoadmap(stats) {
  const subjects = Object.keys(stats.subjectStats)
  const weakSubjects = subjects
    .sort((a, b) => (stats.subjectStats[a].averageScore || 0) - (stats.subjectStats[b].averageScore || 0))
    .slice(0, 2)

  const milestones = [
    {
      id: 1,
      title: "Foundation Building",
      description: "Master core concepts in weak areas",
      subjects: weakSubjects,
      duration: "2 weeks",
      tasks: ["Review fundamental concepts", "Complete 20 flashcards daily", "Take 2 practice quizzes"],
      completed: false,
      progress: 0,
    },
    {
      id: 2,
      title: "Intermediate Practice",
      description: "Strengthen understanding with practice",
      subjects: weakSubjects,
      duration: "3 weeks",
      tasks: ["Solve 10 problems daily", "Review generated notes", "Take weekly quizzes"],
      completed: false,
      progress: 0,
    },
    {
      id: 3,
      title: "Advanced Mastery",
      description: "Achieve excellence in all subjects",
      subjects: subjects,
      duration: "2 weeks",
      tasks: ["Complete mock exams", "Review mistakes", "Final revision"],
      completed: false,
      progress: 0,
    },
  ]

  const recommendations = [
    {
      id: 1,
      type: "focus",
      title: "Focus on Weak Areas",
      description: `Your performance in ${weakSubjects.join(", ")} needs improvement. Dedicate 30 mins daily to these subjects.`,
      priority: "high",
      action: "Start Practice",
    },
    {
      id: 2,
      type: "consistency",
      title: "Maintain Study Consistency",
      description: `You've studied ${stats.totalStudyHours.toFixed(1)} hours. Aim for 2 hours daily for optimal results.`,
      priority: "medium",
      action: "Set Reminder",
    },
    {
      id: 3,
      type: "quiz",
      title: "Take More Quizzes",
      description: `You've taken ${stats.quizzesTaken} quizzes. Regular quizzes improve retention by 40%.`,
      priority: "medium",
      action: "Start Quiz",
    },
    {
      id: 4,
      type: "review",
      title: "Review Generated Notes",
      description: "Use AI-generated notes for quick revision before exams.",
      priority: "low",
      action: "View Notes",
    },
  ]

  return {
    roadmap: {
      id: Date.now(),
      title: "Your Personalized Learning Roadmap",
      description: "Based on your activity and performance",
      milestones,
      estimatedDuration: "7 weeks",
      successRate: 85,
    },
    recommendations,
  }
}
