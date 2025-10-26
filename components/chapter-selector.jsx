"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export function ChapterSelector({ fileId, onGenerate, isGenerating, topics }) {
  const [expanded, setExpanded] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState("")

  const handleGenerate = () => {
    if (selectedTopic) {
      onGenerate([selectedTopic])
      setSelectedTopic("")
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
          Select a topic to generate AI-powered concise notes
        </p>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {/* Topic Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Topic</label>
            <Select value={selectedTopic} onValueChange={setSelectedTopic} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a topic to generate notes" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic, index) => (
                  <SelectItem key={index} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleGenerate}
              disabled={!selectedTopic || isGenerating}
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
