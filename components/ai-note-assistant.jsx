"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { setLoading } from "@/lib/slices/aiSlice"
import { Sparkles, Loader2 } from "lucide-react"

// Mock AI note analysis
const analyzeNoteWithAI = async (noteContent) => {
  await new Promise((resolve) => setTimeout(resolve, 1200))

  return {
    summary: `This note covers important concepts and key points. The main ideas include understanding fundamental principles, their applications, and practical implications. Key takeaways include improved comprehension and better retention of material.`,
    keyPoints: [
      "Understanding core concepts is essential for mastery",
      "Practical applications enhance learning retention",
      "Regular review strengthens memory consolidation",
      "Active engagement improves comprehension",
    ],
    questions: [
      "What are the main concepts discussed in this note?",
      "How can these concepts be applied in practice?",
      "What are the key relationships between different ideas?",
    ],
    studyTips: [
      "Create mind maps to visualize relationships",
      "Practice active recall with flashcards",
      "Teach the concepts to someone else",
      "Apply concepts to real-world scenarios",
    ],
  }
}

export function AINoteAssistant({ noteContent }) {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.ai.loading)
  const [open, setOpen] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleAnalyze = async () => {
    dispatch(setLoading(true))
    try {
      const result = await analyzeNoteWithAI(noteContent)
      setAnalysis(result)
    } catch (error) {
      console.error("Error analyzing note:", error)
    } finally {
      dispatch(setLoading(false))
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Sparkles className="w-4 h-4" />
          AI Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Note Analysis
          </DialogTitle>
        </DialogHeader>

        {!analysis ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get AI-powered insights about your notes including summaries, key points, study questions, and tips.
            </p>
            <Button onClick={handleAnalyze} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Note
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <Card className="bg-blue-500/10 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{analysis.summary}</p>
              </CardContent>
            </Card>

            {/* Key Points */}
            <Card className="bg-purple-500/10 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-base">Key Points</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex gap-2 text-sm">
                      <span className="text-purple-500 font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Study Questions */}
            <Card className="bg-green-500/10 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-base">Study Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.questions.map((q, idx) => (
                    <li key={idx} className="flex gap-2 text-sm">
                      <span className="text-green-500 font-bold">{idx + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Study Tips */}
            <Card className="bg-orange-500/10 border-orange-500/20">
              <CardHeader>
                <CardTitle className="text-base">Study Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.studyTips.map((tip, idx) => (
                    <li key={idx} className="flex gap-2 text-sm">
                      <span className="text-orange-500 font-bold">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Button onClick={() => setAnalysis(null)} variant="outline" className="w-full">
              Analyze Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
