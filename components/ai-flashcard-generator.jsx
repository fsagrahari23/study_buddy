"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { generateFlashcards } from "@/lib/slices/flashcardsSlice"
import { Sparkles, Loader2 } from "lucide-react"

export function AIFlashcardGenerator({ deckId, onCardsGenerated }) {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.flashcards.loading)
  const [open, setOpen] = useState(false)
  const [topic, setTopic] = useState("")
  const [content, setContent] = useState("")
  const [generatedCards, setGeneratedCards] = useState([])

  const handleGenerate = async () => {
    if (!topic.trim() || !content.trim()) return

    try {
      const result = await dispatch(generateFlashcards({ deckId, topic, content })).unwrap()
      setGeneratedCards(result)
      onCardsGenerated?.()
    } catch (error) {
      console.error("Error generating flashcards:", error)
    }
  }

  const handleAddCards = () => {
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
                <Card key={card._id} className="bg-muted/50">
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground mb-2">Card {idx + 1}</p>
                    <p className="font-medium text-sm mb-2">Q: {card.front}</p>
                    <p className="text-sm text-muted-foreground">A: {card.back}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddCards} className="flex-1">
                Done
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
