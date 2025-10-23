"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function FlashcardCard({ card, onFeedback, isFlipped: initialFlipped = false }) {
  const [isFlipped, setIsFlipped] = useState(initialFlipped)

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Card */}
      <div
        className="w-full max-w-md h-80 cursor-pointer perspective"
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          perspective: "1000px",
        }}
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <Card
            className="absolute w-full h-full flex items-center justify-center p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary"
            style={{
              backfaceVisibility: "hidden",
            }}
          >
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Question</p>
              <p className="text-2xl font-bold">{card.question}</p>
              <p className="text-xs text-muted-foreground mt-8">Click to reveal answer</p>
            </CardContent>
          </Card>

          {/* Back */}
          <Card
            className="absolute w-full h-full flex items-center justify-center p-8 bg-gradient-to-br from-secondary/10 to-secondary/5 border-2 border-secondary"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Answer</p>
              <p className="text-2xl font-bold">{card.answer}</p>
              <p className="text-xs text-muted-foreground mt-8">Click to see question</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feedback Buttons */}
      <div className="flex gap-4 w-full max-w-md">
        <Button
          variant="outline"
          className="flex-1 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
          onClick={() => onFeedback(0)}
        >
          Again
        </Button>
        <Button
          variant="outline"
          className="flex-1 text-yellow-600 border-yellow-200 hover:bg-yellow-50 bg-transparent"
          onClick={() => onFeedback(1)}
        >
          Hard
        </Button>
        <Button
          variant="outline"
          className="flex-1 text-green-600 border-green-200 hover:bg-green-50 bg-transparent"
          onClick={() => onFeedback(2)}
        >
          Good
        </Button>
      </div>

      {/* Card Stats */}
      <div className="w-full max-w-md grid grid-cols-3 gap-4 text-center text-sm">
        <div className="p-3 rounded-lg bg-muted">
          <p className="text-muted-foreground">Easiness</p>
          <p className="font-bold">{card.easiness.toFixed(1)}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted">
          <p className="text-muted-foreground">Interval</p>
          <p className="font-bold">{card.interval} days</p>
        </div>
        <div className="p-3 rounded-lg bg-muted">
          <p className="text-muted-foreground">Reps</p>
          <p className="font-bold">{card.repetitions}</p>
        </div>
      </div>
    </div>
  )
}
