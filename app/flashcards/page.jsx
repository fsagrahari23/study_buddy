"use client"

import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { setCurrentDeck, addDeck } from "@/lib/slices/flashcardsSlice"
import { AIFlashcardGenerator } from "@/components/ai-flashcard-generator"
import { Zap, Plus, BookOpen } from "lucide-react"
import Link from "next/link"

export default function FlashcardsPage() {
  const dispatch = useDispatch()
  const decks = useSelector((state) => state.flashcards.decks)
  const currentDeck = useSelector((state) => state.flashcards.currentDeck)
  const [showNewDeck, setShowNewDeck] = useState(false)
  const [newDeckName, setNewDeckName] = useState("")

  const handleCreateDeck = () => {
    if (newDeckName.trim()) {
      const newDeck = {
        id: Date.now().toString(),
        name: newDeckName,
        cards: 0,
        dueToday: 0,
        createdAt: new Date(),
      }
      dispatch(addDeck(newDeck))
      setNewDeckName("")
      setShowNewDeck(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Flashcards</h1>
          <p className="text-muted-foreground">Study with spaced repetition</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Decks */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Decks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {decks.map((deck) => (
                  <button
                    key={deck.id}
                    onClick={() => dispatch(setCurrentDeck(deck))}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      currentDeck?.id === deck.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-medium text-sm">{deck.name}</p>
                    <p className="text-xs text-muted-foreground">{deck.cards} cards</p>
                    {deck.dueToday > 0 && (
                      <p className="text-xs text-primary font-semibold mt-1">{deck.dueToday} due today</p>
                    )}
                  </button>
                ))}

                {showNewDeck ? (
                  <div className="p-3 border-2 border-dashed border-primary rounded-lg space-y-2">
                    <Input
                      placeholder="Deck name..."
                      value={newDeckName}
                      onChange={(e) => setNewDeckName(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleCreateDeck} className="flex-1">
                        Create
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowNewDeck(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => setShowNewDeck(true)} variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    New Deck
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentDeck ? (
              <div className="space-y-6">
                {/* Deck Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">{currentDeck.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">
                          {currentDeck.cards} cards • {currentDeck.dueToday} due today
                        </p>
                      </div>
                      <Link href={`/flashcards/deck/${currentDeck.id}`}>
                        <Button>
                          <Zap className="w-4 h-4 mr-2" />
                          Study Now
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                </Card>

                {/* Deck Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Cards</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{currentDeck.cards}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Due Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-primary">{currentDeck.dueToday}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">New Cards</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">0</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Study Session
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Review {currentDeck.dueToday} cards due today
                      </p>
                      <Link href={`/flashcards/deck/${currentDeck.id}`}>
                        <Button className="w-full">Start Studying</Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add Cards
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {currentDeck && <AIFlashcardGenerator deckId={currentDeck.id} />}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No deck selected. Create or select a deck to get started.</p>
                <Button onClick={() => setShowNewDeck(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Deck
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
