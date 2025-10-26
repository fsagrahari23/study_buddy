"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { setAIExplanation, setLoadingExplanation } from "@/lib/slices/detailedAnswersSlice"
import { Sparkles, AlertCircle, CheckCircle2 } from "lucide-react"

export function QuestionDetailCard({ question, questionIndex, userAnswer, isCorrect, totalQuestions }) {
  const dispatch = useDispatch()
  const [showExplanation, setShowExplanation] = useState(false)
  const aiExplanations = useSelector((state) => state.detailedAnswers.aiExplanations)
  const loadingExplanations = useSelector((state) => state.detailedAnswers.loadingExplanations)

  const explanation = aiExplanations[question.id]
  const isLoading = loadingExplanations[question.id]

  const handleGetAIExplanation = async () => {
    if (explanation) {
      setShowExplanation(!showExplanation)
      return
    }

    dispatch(setLoadingExplanation(question.id))

    // Simulate AI explanation generation
    setTimeout(() => {
      const aiExplanationText = `
        <strong>Detailed Analysis:</strong><br/>
        <p>The correct answer is "<strong>${question.correctAnswer}</strong>"</p>

        <strong>Why this is correct:</strong><br/>
        <p>${question.explanation}</p>

        <strong>Why your answer was incorrect:</strong><br/>
        <p>You selected "${userAnswer}". This is a common misconception because it doesn't follow the proper methodology. The key concept here is understanding ${question.question.toLowerCase().split(" ").slice(0, 3).join(" ")}.</p>

        <strong>Related Concepts:</strong><br/>
        <ul style="margin-left: 20px; margin-top: 8px;">
          <li>Fundamental principle: Understanding the core concept</li>
          <li>Common mistakes: Misapplying formulas or rules</li>
          <li>Practice tip: Review similar problems to strengthen understanding</li>
        </ul>

        <strong>Recommended Study Resources:</strong><br/>
        <ul style="margin-left: 20px; margin-top: 8px;">
          <li>Review Chapter 2: Algebra Basics (Pages 45-78)</li>
          <li>Practice similar problems from the textbook</li>
          <li>Watch video tutorials on this topic</li>
        </ul>
      `

      dispatch(
        setAIExplanation({
          questionId: question.id,
          explanation: aiExplanationText,
        }),
      )
      setShowExplanation(true)
    }, 1500)
  }

  const correctAnswer = question.correctAnswer

  return (
    <Card
      className={`transition-all ${isCorrect
          ? "border-green-500/30 bg-gradient-to-r from-green-500/5 to-transparent"
          : "border-red-500/30 bg-gradient-to-r from-red-500/5 to-transparent"
        }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <CardTitle className="text-lg">
                Question {questionIndex + 1} of {totalQuestions}
              </CardTitle>
              <span
                className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${isCorrect ? "bg-green-500/20 text-green-700" : "bg-red-500/20 text-red-700"
                  }`}
              >
                {isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>
            <p className="text-base font-medium mt-3">{question.question}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Answer Comparison */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2">YOUR ANSWER</p>
            <p className={`font-medium ${isCorrect ? "text-green-600" : "text-red-600"}`}>{userAnswer}</p>
          </div>

          {!isCorrect && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-xs font-semibold text-green-700 mb-2">CORRECT ANSWER</p>
              <p className="font-medium text-green-600">{correctAnswer}</p>
            </div>
          )}
        </div>

        {/* All Options Display */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">ALL OPTIONS</p>
          <div className="grid gap-2">
            {question.options.map((option, idx) => {
              const isUserSelected = option === userAnswer
              const isCorrectOption = option === correctAnswer

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border-2 transition-all ${isCorrectOption
                      ? "border-green-500/50 bg-green-500/10"
                      : isUserSelected
                        ? "border-red-500/50 bg-red-500/10"
                        : "border-border bg-muted/30"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold ${isCorrectOption
                          ? "border-green-500 bg-green-500 text-white"
                          : isUserSelected
                            ? "border-red-500 bg-red-500 text-white"
                            : "border-border"
                        }`}
                    >
                      {isCorrectOption ? "✓" : isUserSelected ? "✗" : String.fromCharCode(65 + idx)}
                    </div>
                    <span className="font-medium text-sm">{option}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* AI Explanation Button */}
        <Button
          onClick={handleGetAIExplanation}
          variant="outline"
          className="w-full gap-2 bg-transparent"
          disabled={isLoading}
        >
          <Sparkles className="w-4 h-4" />
          {isLoading ? "Generating AI Explanation..." : explanation ? "View AI Explanation" : "Get AI Explanation"}
        </Button>

        {/* AI Explanation Content */}
        {explanation && showExplanation && (
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <p className="font-semibold text-blue-700">AI-Powered Explanation</p>
            </div>
            <div
              className="text-sm text-foreground space-y-2 prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: explanation }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
