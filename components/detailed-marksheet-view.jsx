"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Sparkles, TrendingDown, CheckCircle2, Loader2 } from "lucide-react"
import { setDetailedAnalysis, setAnalysisLoading, setAnalysisError } from "@/lib/slices/marksheetSlice"

// Mock AI analysis generator
const generateDetailedAnalysis = async (quizResult, quiz) => {
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const weakAreas = [
    { topic: "Algebra", percentage: 45, questions: 2 },
    { topic: "Geometry", percentage: 60, questions: 3 },
    { topic: "Calculus", percentage: 75, questions: 4 },
  ]

  const strongAreas = [
    { topic: "Basic Arithmetic", percentage: 95, questions: 5 },
    { topic: "Linear Equations", percentage: 85, questions: 4 },
  ]

  const recommendations = [
    {
      priority: "high",
      title: "Focus on Algebra Fundamentals",
      description: "You scored 45% in algebra. Review basic algebraic operations and practice more problems.",
      action: "Start Algebra Flashcard Deck",
    },
    {
      priority: "medium",
      title: "Strengthen Geometry Concepts",
      description: "Your geometry score is 60%. Work on understanding geometric proofs and theorems.",
      action: "Take Geometry Quiz",
    },
    {
      priority: "low",
      title: "Maintain Your Strength",
      description: "You're doing great in arithmetic! Keep practicing to maintain this level.",
      action: "Continue Practice",
    },
  ]

  const aiInsights = {
    overallPerformance: `Your overall performance shows a score of ${quizResult.score}/${quizResult.totalScore} (${Math.round((quizResult.score / quizResult.totalScore) * 100)}%). This indicates ${Math.round((quizResult.score / quizResult.totalScore) * 100) > 70 ? "good understanding" : "need for improvement"} of the subject matter.`,
    strengths:
      "You demonstrated strong performance in basic arithmetic and linear equations, showing solid foundational knowledge.",
    improvements:
      "Focus on improving your algebra and geometry skills. These areas show the most room for growth and are fundamental for advanced topics.",
    studyStrategy:
      "Allocate 60% of your study time to weak areas, 30% to medium areas, and 10% to maintaining strong areas. Use spaced repetition for better retention.",
  }

  return {
    resultId: quizResult.id,
    quizTitle: quiz.title,
    weakAreas,
    strongAreas,
    recommendations,
    aiInsights,
    generatedAt: new Date(),
  }
}

export function DetailedMarksheetView({ resultId, quizResult, quiz }) {
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleGenerateAnalysis = async () => {
    setLoading(true)
    dispatch(setAnalysisLoading(true))
    try {
      const result = await generateDetailedAnalysis(quizResult, quiz)
      setAnalysis(result)
      dispatch(setDetailedAnalysis(result))
      dispatch(setAnalysisError(null))
    } catch (error) {
      console.error("Error generating analysis:", error)
      dispatch(setAnalysisError("Failed to generate analysis"))
    } finally {
      setLoading(false)
      dispatch(setAnalysisLoading(false))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Sparkles className="w-4 h-4" />
          View Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Detailed Marksheet Analysis
          </DialogTitle>
        </DialogHeader>

        {!analysis ? (
          <div className="space-y-4 py-6">
            <Card className="bg-blue-500/10 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-base">{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Score</p>
                    <p className="text-2xl font-bold">
                      {quizResult.score}/{quizResult.totalScore}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Percentage</p>
                    <p className="text-2xl font-bold text-primary">
                      {Math.round((quizResult.score / quizResult.totalScore) * 100)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Time Spent</p>
                    <p className="text-2xl font-bold">{quizResult.timeSpent} min</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleGenerateAnalysis} disabled={loading} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Your Performance...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Analysis
                </>
              )}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="weak">Weak Areas</TabsTrigger>
              <TabsTrigger value="strong">Strong Areas</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-2">Overall Performance</p>
                    <p className="text-sm text-muted-foreground">{analysis.aiInsights.overallPerformance}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Your Strengths</p>
                    <p className="text-sm text-green-600">{analysis.aiInsights.strengths}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Areas for Improvement</p>
                    <p className="text-sm text-orange-600">{analysis.aiInsights.improvements}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Recommended Study Strategy</p>
                    <p className="text-sm text-blue-600">{analysis.aiInsights.studyStrategy}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Correct", value: quizResult.correctAnswers },
                          { name: "Incorrect", value: quizResult.totalQuestions - quizResult.correctAnswers },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Weak Areas Tab */}
            <TabsContent value="weak" className="space-y-4">
              <Card className="bg-red-500/10 border-red-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <TrendingDown className="w-5 h-5" />
                    Areas Needing Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analysis.weakAreas}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="topic" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="percentage" fill="#ef4444" name="Score %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {analysis.weakAreas.map((area, idx) => (
                  <Card key={idx} className="bg-red-500/5 border-red-500/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-1">{area.topic}</p>
                          <p className="text-xs text-muted-foreground">
                            Score: {area.percentage}% • Questions: {area.questions}
                          </p>
                          <p className="text-xs text-red-600 mt-2">
                            Focus on this area to improve your overall performance
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-red-600">{area.percentage}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Strong Areas Tab */}
            <TabsContent value="strong" className="space-y-4">
              <Card className="bg-green-500/10 border-green-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    Your Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analysis.strongAreas}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="topic" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="percentage" fill="#10b981" name="Score %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {analysis.strongAreas.map((area, idx) => (
                  <Card key={idx} className="bg-green-500/5 border-green-500/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-1">{area.topic}</p>
                          <p className="text-xs text-muted-foreground">
                            Score: {area.percentage}% • Questions: {area.questions}
                          </p>
                          <p className="text-xs text-green-600 mt-2">Keep practicing to maintain this level</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{area.percentage}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-4">
              <div className="space-y-3">
                {analysis.recommendations.map((rec, idx) => (
                  <Card
                    key={idx}
                    className={`border-l-4 ${
                      rec.priority === "high"
                        ? "border-l-red-500 bg-red-500/5"
                        : rec.priority === "medium"
                          ? "border-l-orange-500 bg-orange-500/5"
                          : "border-l-green-500 bg-green-500/5"
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded ${
                                rec.priority === "high"
                                  ? "bg-red-500/20 text-red-600"
                                  : rec.priority === "medium"
                                    ? "bg-orange-500/20 text-orange-600"
                                    : "bg-green-500/20 text-green-600"
                              }`}
                            >
                              {rec.priority.toUpperCase()}
                            </span>
                            <p className="font-semibold text-sm">{rec.title}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{rec.description}</p>
                          <Button size="sm" variant="outline">
                            {rec.action}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
