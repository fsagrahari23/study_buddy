"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sparkles, Loader2, TrendingUp, AlertCircle, Zap } from "lucide-react"

// Mock AI recommendations
const getStudyRecommendations = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1200))

  return {
    strengths: [
      "Excellent performance in History (92%)",
      "Strong grasp of Chemistry concepts (88%)",
      "Consistent study habits with 7-day streak",
    ],
    improvements: [
      "Physics needs more focus (72% - lowest score)",
      "Increase daily study time by 1 hour",
      "Review Physics fundamentals before advanced topics",
    ],
    recommendations: [
      "Create flashcards for Physics formulas and concepts",
      "Take a Physics quiz every 2 days to reinforce learning",
      "Use AI to generate practice problems for weak areas",
      "Study Physics during peak focus hours (morning)",
    ],
    nextSteps: [
      "Complete 5 Physics flashcards today",
      "Take a 10-question Physics quiz tomorrow",
      "Review Physics notes with AI assistant",
      "Schedule a 2-hour Physics study session this weekend",
    ],
  }
}

export function AIStudyRecommendations() {
  const [open, setOpen] = useState(false)
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleGetRecommendations = async () => {
    setLoading(true)
    try {
      const result = await getStudyRecommendations()
      setRecommendations(result)
    } catch (error) {
      console.error("Error getting recommendations:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Sparkles className="w-4 h-4" />
          AI Study Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Personalized Study Recommendations
          </DialogTitle>
        </DialogHeader>

        {!recommendations ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get AI-powered personalized study recommendations based on your performance, strengths, and areas for
              improvement.
            </p>
            <Button onClick={handleGetRecommendations} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Recommendations
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Strengths */}
            <Card className="bg-green-500/10 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Your Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.strengths.map((strength, idx) => (
                    <li key={idx} className="flex gap-2 text-sm">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card className="bg-orange-500/10 border-orange-500/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.improvements.map((improvement, idx) => (
                    <li key={idx} className="flex gap-2 text-sm">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-blue-500/10 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Study Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex gap-2 text-sm">
                      <span className="text-blue-600 font-bold">{idx + 1}.</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="bg-purple-500/10 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  Your Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.nextSteps.map((step, idx) => (
                    <li key={idx} className="flex gap-2 text-sm">
                      <span className="text-purple-600 font-bold">→</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Button onClick={() => setRecommendations(null)} variant="outline" className="w-full">
              Get New Recommendations
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
