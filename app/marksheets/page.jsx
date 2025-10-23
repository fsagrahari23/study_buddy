"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIAnswerExplainer } from "@/components/ai-answer-explainer"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Download } from "lucide-react"
import Link from "next/link"

// Mock questions data
const mockQuestions = [
  {
    id: 1,
    question: "What is the derivative of x²?",
    options: ["2x", "x", "2", "x²"],
    correct: "2x",
    correctIndex: 0,
  },
  {
    id: 2,
    question: "What is the integral of 2x?",
    options: ["x²", "2x²", "x² + C", "2x + C"],
    correct: "x² + C",
    correctIndex: 2,
  },
  {
    id: 3,
    question: "What is the value of π?",
    options: ["3.12", "3.14", "3.16", "3.18"],
    correct: "3.14",
    correctIndex: 1,
  },
  {
    id: 4,
    question: "What is 5 + 3 × 2?",
    options: ["16", "11", "13", "10"],
    correct: "11",
    correctIndex: 1,
  },
  {
    id: 5,
    question: "What is the square root of 144?",
    options: ["10", "11", "12", "13"],
    correct: "12",
    correctIndex: 2,
  },
]

export default function MarksheetsPage() {
  const results = useSelector((state) => state.quizzes.results)
  const quizzes = useSelector((state) => state.quizzes.quizzes)
  const [expandedResult, setExpandedResult] = useState(null)

  // Prepare data for charts
  const chartData = results.map((result) => {
    const quiz = quizzes.find((q) => q.id === result.quizId)
    return {
      name: quiz?.title || "Quiz",
      score: result.score,
      total: result.totalScore,
      percentage: Math.round((result.score / result.totalScore) * 100),
    }
  })

  const totalScore = results.reduce((sum, r) => sum + r.score, 0)
  const totalPossible = results.reduce((sum, r) => sum + r.totalScore, 0)
  const averagePercentage = results.length > 0 ? Math.round((totalScore / totalPossible) * 100) : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Marksheets</h1>
            <p className="text-muted-foreground">Your quiz performance and detailed results</p>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalScore}</div>
              <p className="text-xs text-muted-foreground mt-1">out of {totalPossible}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{averagePercentage}%</div>
              <p className="text-xs text-muted-foreground mt-1">Quiz average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Quizzes Taken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{results.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Total attempts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Best Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {results.length > 0 ? Math.max(...results.map((r) => Math.round((r.score / r.totalScore) * 100))) : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Highest percentage</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Score Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#3b82f6" name="Score" />
                  <Bar dataKey="total" fill="#e5e7eb" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="percentage" stroke="#3b82f6" name="Percentage %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Answers</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            {/* Detailed Results Table */}
            <Card>
              <CardHeader>
                <CardTitle>Quiz Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold">Quiz</th>
                        <th className="text-left py-3 px-4 font-semibold">Score</th>
                        <th className="text-left py-3 px-4 font-semibold">Percentage</th>
                        <th className="text-left py-3 px-4 font-semibold">Date</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.map((row, idx) => {
                        const result = results[idx]
                        const quiz = quizzes.find((q) => q.id === result.quizId)
                        return (
                          <tr key={idx} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4">{row.name}</td>
                            <td className="py-3 px-4 font-medium">
                              {row.score} / {row.total}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                                {row.percentage}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {result?.date ? new Date(result.date).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="py-3 px-4">
                              <Link href={`/quizzes/${result.quizId}/detailed-answers`}>
                                <Button variant="outline" size="sm">
                                  View Answers
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Answer Review with AI Explanations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockQuestions.map((q, idx) => {
                  const isCorrect = idx % 2 === 0 // Mock: alternate correct/incorrect
                  const userAnswer = q.options[(idx + 1) % q.options.length]

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-lg border-2 ${
                        isCorrect ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-sm font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                              {isCorrect ? "✓" : "✗"}
                            </span>
                            <p className="font-medium text-sm">{q.question}</p>
                          </div>

                          <div className="grid md:grid-cols-2 gap-3 mt-3">
                            <div className="text-sm">
                              <p className="text-xs text-muted-foreground mb-1">Your Answer:</p>
                              <p className={`font-medium ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                                {userAnswer}
                              </p>
                            </div>
                            {!isCorrect && (
                              <div className="text-sm">
                                <p className="text-xs text-muted-foreground mb-1">Correct Answer:</p>
                                <p className="font-medium text-green-600">{q.correct}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <AIAnswerExplainer
                          question={q.question}
                          correctAnswer={q.correct}
                          userAnswer={userAnswer}
                          isCorrect={isCorrect}
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}