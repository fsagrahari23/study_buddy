"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QuestionDetailCard } from "@/components/question-detail-card"
import { setCurrentQuestion, resetDetailedAnswers } from "@/lib/slices/detailedAnswersSlice"
import { ChevronLeft, ChevronRight, BookOpen, Clock, Target, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function DetailedAnswersPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const quizId = params.quizId

  const quiz = useSelector((state) => state.quizzes.quizzes.find((q) => q.id === quizId))
  const results = useSelector((state) => state.quizzes.results.find((r) => r.quizId === quizId))
  const currentQuestion = useSelector((state) => state.detailedAnswers.currentQuestion)

  // Mock user answers for demonstration
  const [userAnswers, setUserAnswers] = useState({})

  useEffect(() => {
    // Initialize mock answers
    const mockAnswers = {}
    quiz?.questions?.forEach((q, idx) => {
      mockAnswers[idx] = q.options[(idx + 1) % q.options.length]
    })
    setUserAnswers(mockAnswers)
    dispatch(resetDetailedAnswers())
  }, [quiz, dispatch])

  if (!quiz || !results) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Quiz or results not found</p>
        </div>
      </DashboardLayout>
    )
  }

  const questions = quiz.questions || []
  const question = questions[currentQuestion]
  const userAnswer = userAnswers[currentQuestion]
  const isCorrect = userAnswer === question?.options[question?.correct]

  // Calculate statistics
  const correctCount = Object.keys(userAnswers).reduce((acc, idx) => {
    return acc + (userAnswers[idx] === questions[idx]?.options[questions[idx]?.correct] ? 1 : 0)
  }, 0)

  const weakAreas = questions
    .map((q, idx) => ({
      question: q.question,
      difficulty: q.difficulty,
      isCorrect: userAnswers[idx] === q.options[q.correct],
    }))
    .filter((q) => !q.isCorrect)

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      dispatch(setCurrentQuestion(currentQuestion + 1))
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      dispatch(setCurrentQuestion(currentQuestion - 1))
    }
  }

  const handleJumpToQuestion = (idx) => {
    dispatch(setCurrentQuestion(idx))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/marksheets" className="flex items-center gap-2 text-primary hover:underline">
            <ChevronLeft className="w-4 h-4" />
            Back to Marksheets
          </Link>
          <Button variant="outline" onClick={() => router.push("/quizzes")}>
            Back to Quizzes
          </Button>
        </div>

        {/* Quiz Info */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {quiz.chapter}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {results.timeSpent} minutes spent
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              Score: {results.score}/{results.totalScore}
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{results.score}</div>
              <p className="text-xs text-muted-foreground mt-1">out of {results.totalScore}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Percentage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {Math.round((results.score / results.totalScore) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Overall performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Correct</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{correctCount}</div>
              <p className="text-xs text-muted-foreground mt-1">out of {questions.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Weak Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{weakAreas.length}</div>
              <p className="text-xs text-muted-foreground mt-1">questions to review</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const qIsCorrect = userAnswers[idx] === q.options[q.correct]
                    return (
                      <button
                        key={idx}
                        onClick={() => handleJumpToQuestion(idx)}
                        className={`w-full aspect-square rounded-lg font-semibold text-sm transition-all ${
                          currentQuestion === idx
                            ? "ring-2 ring-primary"
                            : qIsCorrect
                              ? "bg-green-500/20 text-green-700 hover:bg-green-500/30"
                              : "bg-red-500/20 text-red-700 hover:bg-red-500/30"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="space-y-2 mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500" />
                    <span>Correct</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500" />
                    <span>Incorrect</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Detail */}
          <div className="lg:col-span-3 space-y-6">
            {question && (
              <>
                <QuestionDetailCard
                  question={question}
                  questionIndex={currentQuestion}
                  userAnswer={userAnswer}
                  isCorrect={isCorrect}
                  totalQuestions={questions.length}
                />

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentQuestion === 0}
                    className="sm:flex-1 bg-transparent"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={currentQuestion === questions.length - 1}
                    className="sm:flex-1"
                  >
                    Next Question
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Weak Areas Analysis */}
        {weakAreas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weakAreas.map((area, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{area.question}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Difficulty: <span className="capitalize font-semibold">{area.difficulty}</span>
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-red-500/20 text-red-700">Review</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
