"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronUp } from "lucide-react"

const SAMPLE_CHAPTERS = {
  1: [
    { id: "ch1", title: "Chapter 1: Introduction to Calculus", pages: "1-25" },
    { id: "ch2", title: "Chapter 2: Limits and Continuity", pages: "26-52" },
    { id: "ch3", title: "Chapter 3: Derivatives", pages: "53-89" },
    { id: "ch4", title: "Chapter 4: Applications of Derivatives", pages: "90-125" },
    { id: "ch5", title: "Chapter 5: Integration", pages: "126-165" },
  ],
  2: [
    { id: "ch1", title: "Chapter 1: Motion and Forces", pages: "1-30" },
    { id: "ch2", title: "Chapter 2: Energy and Work", pages: "31-60" },
    { id: "ch3", title: "Chapter 3: Waves and Sound", pages: "61-95" },
    { id: "ch4", title: "Chapter 4: Electricity and Magnetism", pages: "96-140" },
  ],
}

export function ChapterSelector({ fileId, onGenerate, isGenerating }) {
  const [expanded, setExpanded] = useState(false)
  const [selectedChapters, setSelectedChapters] = useState([])

  const chapters = SAMPLE_CHAPTERS[fileId] || []

  const handleChapterToggle = (chapterId) => {
    setSelectedChapters((prev) =>
      prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId],
    )
  }

  const handleSelectAll = () => {
    if (selectedChapters.length === chapters.length) {
      setSelectedChapters([])
    } else {
      setSelectedChapters(chapters.map((ch) => ch.id))
    }
  }

  const handleGenerate = () => {
    if (selectedChapters.length > 0) {
      onGenerate(selectedChapters)
      setSelectedChapters([])
    }
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <span className="text-lg">📚</span>
            Generate Concise Notes
          </CardTitle>
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Select chapters to generate AI-powered concise notes
        </p>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {/* Select All */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Checkbox
              id="select-all"
              checked={selectedChapters.length === chapters.length && chapters.length > 0}
              onCheckedChange={handleSelectAll}
              disabled={isGenerating}
            />
            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer flex-1">
              Select All Chapters
            </label>
            <span className="text-xs text-muted-foreground">
              {selectedChapters.length}/{chapters.length}
            </span>
          </div>

          {/* Chapters List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded transition-colors">
                <Checkbox
                  id={chapter.id}
                  checked={selectedChapters.includes(chapter.id)}
                  onCheckedChange={() => handleChapterToggle(chapter.id)}
                  disabled={isGenerating}
                  className="mt-1"
                />
                <label htmlFor={chapter.id} className="text-sm cursor-pointer flex-1">
                  <p className="font-medium">{chapter.title}</p>
                  <p className="text-xs text-muted-foreground">Pages {chapter.pages}</p>
                </label>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleGenerate}
              disabled={selectedChapters.length === 0 || isGenerating}
              className="flex-1 text-sm md:text-base"
            >
              {isGenerating ? (
                <>
                  <span className="inline-block animate-spin mr-2">⚙️</span>
                  Generating...
                </>
              ) : (
                <>
                  <span className="mr-2">✨</span>
                  Generate Notes
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setExpanded(false)}
              disabled={isGenerating}
              className="text-sm md:text-base"
            >
              Close
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
