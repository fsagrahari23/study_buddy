"use client"

import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { FlashcardCard } from "@/components/flashcard-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { updateCard } from "@/lib/slices/flashcardsSlice"
import { ChevronLeft, RotateCw } from "lucide-react"
import Link from "next/link"

export default function DeckStudyPage() {
  const params = useParams()
  const deckId = params.deckId
  const dispatch = useDispatch()
  const cards = useSelector((state) => state.flashcards.cards.filter((c) => c.deckId === deckId))
  const deck = useSelector((state) => state.flashcards.decks.find((d) => d.id === deckId))
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [studyStats, setStudyStats] = useState({ correct: 0, hard: 0, again: 0 })

  const currentCard = cards[currentCardIndex]

  const calculateSM2 = (card, feedback) => {
    let { easiness, interval, repetitions } = card

    if (feedback === 0) {
      // Again
      repetitions = 0
      interval = 1
    } else if (feedback === 1) {
      // Hard
      easiness = Math.max(1.3, easiness - 0.2)
      if (repetitions === 0) {
        interval = 1
      } else {
        interval = Math.ceil(interval * easiness)
      }
      repetitions += 1
    } else if (feedback === 2) {
      // Good
      if (repetitions === 0) {
        interval = 1
      } else if (repetitions === 1) {
        interval = 3
      } else {
        interval = Math.ceil(interval * easiness)
      }
      repetitions += 1
    }

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + interval)

    return { easiness, interval, repetitions, dueDate }
  }

  const handleFeedback = (feedback) => {
    const updatedCard = {
      ...currentCard,
      ...calculateSM2(currentCard, feedback),
    }

    dispatch(updateCard(updatedCard))

    if (feedback === 0) {
      setStudyStats((prev) => ({ ...prev, again: prev.again + 1 }))
    } else if (feedback === 1) {
      setStudyStats((prev) => ({ ...prev, hard: prev.hard + 1 }))
    } else {
      setStudyStats((prev) => ({ ...prev, correct: prev.correct + 1 }))
    }

    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
    } else {
      // Study session complete
      setCurrentCardIndex(0)
    }
  }

  const progress = ((currentCardIndex + 1) / cards.length) * 100

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/flashcards" className="flex items-center gap-2 text-primary hover:underline mb-2">
              <ChevronLeft className="w-4 h-4" />
              Back to Decks
            </Link>
            <h1 className="text-3xl font-bold">{deck?.name}</h1>
          </div>
          <Link href="/flashcards">
            <Button variant="outline">
              <RotateCw className="w-4 h-4 mr-2" />
              Exit Study
            </Button>
          </Link>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Card {currentCardIndex + 1} of {cards.length}
              </span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </CardContent>
        </Card>

        {/* Study Area */}
        <div className="flex flex-col items-center justify-center py-12">
          {currentCard ? (
            <FlashcardCard card={currentCard} onFeedback={handleFeedback} />
          ) : (
            <Card className="w-full max-w-md p-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Study Session Complete!</h2>
              <div className="space-y-3 mb-6">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Correct</p>
                  <p className="text-2xl font-bold text-green-600">{studyStats.correct}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Hard</p>
                  <p className="text-2xl font-bold text-yellow-600">{studyStats.hard}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Again</p>
                  <p className="text-2xl font-bold text-red-600">{studyStats.again}</p>
                </div>
              </div>
              <Link href="/flashcards">
                <Button className="w-full">Back to Decks</Button>
              </Link>
            </Card>
          )}
        </div>

        {/* Study Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Session Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Correct</p>
                <p className="text-2xl font-bold text-green-600">{studyStats.correct}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Hard</p>
                <p className="text-2xl font-bold text-yellow-600">{studyStats.hard}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Again</p>
                <p className="text-2xl font-bold text-red-600">{studyStats.again}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
