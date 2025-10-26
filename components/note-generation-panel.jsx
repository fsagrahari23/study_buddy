"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { ChapterSelector } from "./chapter-selector"
import { GeneratedNotesDisplay } from "./generated-notes-display"
import { startGeneration, completeGeneration, failGeneration, clearError } from "@/lib/slices/noteGenerationSlice"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

// Real AI note generation function using API
const generateNotesWithAI = async (chapters, pineconeID) => {
  const apiUrl = "https://helper-function-103741319333.us-central1.run.app/gen_notes"

  const topicName = chapters[0] // Since only one topic is selected

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pineconeID,
        topicName,
      }),
    })

    if (!response.ok) {
      throw new Error(`API call failed for topic "${topicName}": ${response.statusText}`)
    }

    const data = await response.json()
    return data.notes || `Notes for ${topicName}`
  } catch (error) {
    console.error(`Error generating notes for topic "${topicName}":`, error)
    throw new Error(`Failed to generate notes for ${topicName}: ${error.message}`)
  }
}

export function NoteGenerationPanel({ fileId, fileName, topics, pineconeID }) {
  const dispatch = useDispatch()
  const { isGenerating, error, generatedNotes, currentGeneration } = useSelector((state) => state.noteGeneration)

  const handleGenerate = async (selectedChapters) => {
    dispatch(
      startGeneration({
        fileId,
        fileName,
        chapters: selectedChapters,
      }),
    )

    try {
      const content = await generateNotesWithAI(selectedChapters, pineconeID)
      dispatch(completeGeneration({ content }))
    } catch (err) {
      dispatch(failGeneration(err.message || "Failed to generate notes"))
    }
  }

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError())
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, dispatch])

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Generation Failed</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chapter Selector */}
      <ChapterSelector fileId={fileId} onGenerate={handleGenerate} isGenerating={isGenerating} topics={topics} />

      {/* Current Generation Loading State */}
      {isGenerating && currentGeneration && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Generating concise notes...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Processing {currentGeneration.chapters.length} chapter
                  {currentGeneration.chapters.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Notes History */}
      {generatedNotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Generated Notes History</h3>
          {generatedNotes.map((note) => (
            <GeneratedNotesDisplay key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  )
}
