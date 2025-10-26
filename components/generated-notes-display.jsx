"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { deleteGeneratedNote } from "@/lib/slices/noteGenerationSlice"
import { Download, Trash2, Copy, CheckCircle2, Clock } from "lucide-react"
import ReactMarkdown from "react-markdown"

export function GeneratedNotesDisplay({ note }) {
  const dispatch = useDispatch()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(note.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const element = document.createElement("a")
    const file = new Blob([note.content], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `notes-${note.id}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleDelete = () => {
    dispatch(deleteGeneratedNote(note.id))
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const generationTime = note.completedAt
    ? Math.round((new Date(note.completedAt) - new Date(note.startedAt)) / 1000)
    : 0

  return (
    <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <CardTitle className="text-base md:text-lg truncate">{note.fileName}</CardTitle>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              {note.chapters.length} chapter{note.chapters.length !== 1 ? "s" : ""} • Generated{" "}
              {formatTime(note.startedAt)}
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded whitespace-nowrap">
            <Clock className="w-3 h-3" />
            {generationTime}s
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Generated Content */}
        <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm md:text-base leading-relaxed">
            <ReactMarkdown>{note.content}</ReactMarkdown>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="text-xs md:text-sm flex-1 md:flex-none bg-transparent"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="text-xs md:text-sm flex-1 md:flex-none bg-transparent"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-xs md:text-sm flex-1 md:flex-none text-destructive hover:text-destructive bg-transparent"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground pt-2 border-t">
          <div>
            <p className="font-medium">Chapters</p>
            <p>{note.chapters.length}</p>
          </div>
          <div>
            <p className="font-medium">Status</p>
            <p className="text-green-600 dark:text-green-400">Completed</p>
          </div>
          <div>
            <p className="font-medium">Note ID</p>
            <p className="font-mono text-xs">{note.id.slice(0, 8)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
