"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sparkles, Loader2 } from "lucide-react"

// Mock AI explanation
const getAIExplanation = async (question, correctAnswer) => {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    explanation: `This question tests your understanding of fundamental concepts. The correct answer "${correctAnswer}" is the right choice because it accurately represents the core principle being tested. Understanding this concept is crucial for mastering related topics and solving more complex problems.`,
    whyCorrect:
      "This answer correctly applies the fundamental principle and follows the logical reasoning required for this type of problem.",
    commonMistakes: [
      "Confusing similar concepts or terms",
      "Misapplying formulas or rules",
      "Not reading the question carefully",
      "Overlooking important details or conditions",
    ],
    relatedConcepts: [
      "Related concept 1 - Understanding the broader context",
      "Related concept 2 - How this connects to other topics",
      "Related concept 3 - Practical applications",
    ],
  }
}

export function AIAnswerExplainer({ question, correctAnswer, userAnswer, isCorrect }) {
  const [open, setOpen] = useState(false)
  const [explanation, setExplanation] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleGetExplanation = async () => {
    setLoading(true)
    try {
      const result = await getAIExplanation(question, correctAnswer)
      setExplanation(result)
    } catch (error) {
      console.error("Error getting explanation:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Sparkles className="w-4 h-4" />
          AI Explanation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Answer Explanation
          </DialogTitle>
        </DialogHeader>

        {!explanation ? (
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Question:</p>
              <p className="text-sm">{question}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-lg border ${isCorrect ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}
              >
                <p className="text-xs font-medium mb-1">Your Answer:</p>
                <p className="text-sm font-semibold">{userAnswer}</p>
                <p className="text-xs mt-2">{isCorrect ? "✓ Correct" : "✗ Incorrect"}</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                <p className="text-xs font-medium mb-1">Correct Answer:</p>
                <p className="text-sm font-semibold">{correctAnswer}</p>
              </div>
            </div>

            <Button onClick={handleGetExplanation} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get AI Explanation
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Explanation */}
            <Card className="bg-blue-500/10 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-base">Explanation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{explanation.explanation}</p>
              </CardContent>
            </Card>

            {/* Why Correct */}
            <Card className="bg-green-500/10 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-base">Why This Answer is Correct</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{explanation.whyCorrect}</p>
              </CardContent>
            </Card>

            {/* Common Mistakes */}
            <Card className="bg-orange-500/10 border-orange-500/20">
              <CardHeader>
                <CardTitle className="text-base">Common Mistakes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {explanation.commonMistakes.map((mistake, idx) => (
                    <li key={idx} className="flex gap-2 text-sm">
                      <span className="text-orange-500 font-bold">•</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Related Concepts */}
            <Card className="bg-purple-500/10 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-base">Related Concepts</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {explanation.relatedConcepts.map((concept, idx) => (
                    <li key={idx} className="flex gap-2 text-sm">
                      <span className="text-purple-500 font-bold">→</span>
                      <span>{concept}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Button onClick={() => setExplanation(null)} variant="outline" className="w-full">
              Get Another Explanation
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
