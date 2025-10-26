"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { addResult } from "@/lib/slices/quizzesSlice"
import { fetchQuizzes } from "@/lib/slices/quizzesSlice"
import { submitQuizAnswers } from "@/lib/slices/quizzesSlice"
import { ChevronLeft, ChevronRight, Clock, BookOpen } from "lucide-react"
import Link from "next/link"

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId
  const dispatch = useDispatch()
  const quiz = useSelector((state) => state.quizzes.quizzes.find((q) => q._id === quizId || q.id === quizId))

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)

  // Fetch quizzes on component mount if not already loaded
  useEffect(() => {
    if (!quiz) {
      dispatch(fetchQuizzes())
    }
  }, [dispatch, quiz])

  // Use quiz questions or fallback
  const questions = quiz?.questions || []

  const question = questions[currentQuestion]
  const selectedAnswer = answers[currentQuestion]

  const handleSelectAnswer = (index) => {
    setAnswers({ ...answers, [currentQuestion]: index })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      calculateScore()
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateScore = async () => {
    // Convert answers object to array format expected by API
    const answersArray = questions.map((q, idx) => ({
      questionId: q.id,
      selectedAnswer: q.options[answers[idx]],
      isCorrect: q.options[answers[idx]] === q.correctAnswer,
    }))

    const correctCount = answersArray.filter(a => a.isCorrect).length
    const score = Math.round((correctCount / questions.length) * 100) // Score out of 100

    // Submit to API and Redux
    try {
      await dispatch(submitQuizAnswers({
        quizId: quiz._id || quiz.id,
        answers: answersArray,
      })).unwrap()

      // Also add to local state for immediate display
      dispatch(
        addResult({
          id: Date.now().toString(),
          quizId: quiz._id || quiz.id,
          score: score,
          totalScore: 100,
          correctAnswers: correctCount,
          totalQuestions: questions.length,
          date: new Date(),
          timeSpent: timeSpent,
        }),
      )
    } catch (error) {
      console.error("Error submitting quiz:", error)
      // Fallback to local state only
      dispatch(
        addResult({
          id: Date.now().toString(),
          quizId: quiz._id || quiz.id,
          score: score,
          totalScore: 100,
          correctAnswers: correctCount,
          totalQuestions: questions.length,
          date: new Date(),
          timeSpent: timeSpent,
        }),
      )
    }

    setShowResults(true)
  }

  const score = Object.keys(answers).reduce((acc, idx) => {
    const question = questions[idx]
    const userAnswer = question?.options[answers[idx]]
    return acc + (userAnswer === question?.correctAnswer ? 1 : 0)
  }, 0)

  if (!quiz) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Link href="/quizzes" className="flex items-center gap-2 text-primary hover:underline">
            <ChevronLeft className="w-4 h-4" />
            Back to Quizzes
          </Link>

          <Card className="p-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Quiz Complete!</h1>
            <div className="mb-8">
              <div className="text-6xl font-bold text-primary mb-2">{percentage}%</div>
              <p className="text-xl text-muted-foreground">
                You scored {score} out of {questions.length}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-sm text-muted-foreground">Correct</p>
                <p className="text-3xl font-bold text-green-600">{score}</p>
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <p className="text-sm text-muted-foreground">Incorrect</p>
                <p className="text-3xl font-bold text-red-600">{questions.length - score}</p>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-sm text-muted-foreground">Final Score</p>
                <p className="text-3xl font-bold text-blue-600">{percentage}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => router.push("/marksheets")}>View Marksheet</Button>
              <Button variant="outline" onClick={() => router.push("/quizzes")}>
                Back to Quizzes
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link href="/quizzes" className="flex items-center gap-2 text-primary hover:underline">
          <ChevronLeft className="w-4 h-4" />
          Back to Quizzes
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {quiz.chapter}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {quiz.timeLimit || 30} minutes
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-muted-foreground">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        {question && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{question.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${selectedAnswer === idx ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedAnswer === idx ? "border-primary bg-primary" : "border-border"
                        }`}
                    >
                      {selectedAnswer === idx && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
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
          <Button onClick={handleNext} disabled={selectedAnswer === undefined} className="sm:flex-1">
            {currentQuestion === questions.length - 1 ? "Submit Quiz" : "Next Question"}
            {currentQuestion < questions.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
