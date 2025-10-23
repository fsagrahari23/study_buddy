"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { addGeneratedFlashcards, setLoading } from "@/lib/slices/aiSlice"
import { addCard } from "@/lib/slices/flashcardsSlice"
import { Sparkles, Loader2 } from "lucide-react"

// Mock AI flashcard generation
const generateFlashcardsFromText = async (text, topic) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const mockFlashcards = [
    {
      id: `fc-${Date.now()}-1`,
      question: `What is the main concept of ${topic}?`,
      answer: `${topic} is a fundamental concept that involves understanding key principles and their applications.`,
    },
    {
      id: `fc-${Date.now()}-2`,
      question: `How does ${topic} relate to real-world applications?`,
      answer: `${topic} has practical applications in various fields including education, technology, and professional development.`,
    },
    {
      id: `fc-${Date.now()}-3`,
      question: `What are the key benefits of studying ${topic}?`,
      answer: `Key benefits include improved understanding, better retention, and enhanced problem-solving skills.`,
    },
    {
      id: `fc-${Date.now()}-4`,
      question: `Explain the importance of ${topic} in modern context.`,
      answer: `In modern context, ${topic} is crucial for adapting to rapid changes and developing critical thinking abilities.`,
    },
  ]

  return mockFlashcards
}

export function AIFlashcardGenerator({ deckId, onCardsGenerated }) {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.ai.loading)
  const [open, setOpen] = useState(false)
  const [topic, setTopic] = useState("")
  const [content, setContent] = useState("")
  const [generatedCards, setGeneratedCards] = useState([])

  const handleGenerate = async () => {
    if (!topic.trim() || !content.trim()) return

    dispatch(setLoading(true))
    try {
      const cards = await generateFlashcardsFromText(content, topic)
      setGeneratedCards(cards)
      dispatch(addGeneratedFlashcards(cards))
    } catch (error) {
      console.error("Error generating flashcards:", error)
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handleAddCards = () => {
    generatedCards.forEach((card) => {
      dispatch(
        addCard({
          ...card,
          deckId,
          easiness: 2.5,
          interval: 1,
          repetitions: 0,
          dueDate: new Date(),
        }),
      )
    })
    setTopic("")
    setContent("")
    setGeneratedCards([])
    setOpen(false)
    onCardsGenerated?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Flashcard Generator
          </DialogTitle>
        </DialogHeader>

        {generatedCards.length === 0 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Topic</label>
              <Input
                placeholder="e.g., Photosynthesis, World War II, Calculus"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content or Notes</label>
              <Textarea
                placeholder="Paste your notes, article, or content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            </div>
            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Flashcards
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm text-green-700 dark:text-green-400">
                ✓ Generated {generatedCards.length} flashcards successfully!
              </p>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {generatedCards.map((card, idx) => (
                <Card key={card.id} className="bg-muted/50">
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground mb-2">Card {idx + 1}</p>
                    <p className="font-medium text-sm mb-2">Q: {card.question}</p>
                    <p className="text-sm text-muted-foreground">A: {card.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddCards} className="flex-1">
                Add All Cards
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedCards([])
                  setTopic("")
                  setContent("")
                }}
                className="flex-1"
              >
                Generate Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
