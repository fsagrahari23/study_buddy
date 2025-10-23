"use client"

import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateNote } from "@/lib/slices/notesSlice"
import { AINoteAssistant } from "@/components/ai-note-assistant"
import { ChevronLeft, Save, Download } from "lucide-react"
import Link from "next/link"

export default function NoteEditorPage() {
  const params = useParams()
  const router = useRouter()
  const noteId = params.noteId
  const dispatch = useDispatch()
  const note = useSelector((state) => state.notes.notes.find((n) => n.id === noteId))
  const [title, setTitle] = useState(note?.title || "")
  const [content, setContent] = useState(note?.content || "")
  const [tags, setTags] = useState(note?.tags?.join(", ") || "")
  const [saved, setSaved] = useState(true)

  const handleSave = () => {
    dispatch(
      updateNote({
        id: noteId,
        title,
        content,
        tags: tags.split(",").map((t) => t.trim()),
      }),
    )
    setSaved(true)
  }

  const handleChange = (field, value) => {
    setSaved(false)
    if (field === "title") setTitle(value)
    else if (field === "content") setContent(value)
    else if (field === "tags") setTags(value)
  }

  const handleExport = () => {
    const element = document.createElement("a")
    const file = new Blob([`# ${title}\n\n${content}`], { type: "text/markdown" })
    element.href = URL.createObjectURL(file)
    element.download = `${title}.md`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (!note) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Note not found</p>
          <Link href="/notes">
            <Button className="mt-4">Back to Notes</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/notes" className="flex items-center gap-2 text-primary hover:underline">
            <ChevronLeft className="w-4 h-4" />
            Back to Notes
          </Link>
          <div className="flex gap-2">
            <AINoteAssistant noteContent={content} />
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleSave} disabled={saved}>
              <Save className="w-4 h-4 mr-2" />
              {saved ? "Saved" : "Save"}
            </Button>
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <Input
            value={title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="text-2xl font-bold"
            placeholder="Note title..."
          />
        </div>

        {/* Tags Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
          <Input
            value={tags}
            onChange={(e) => handleChange("tags", e.target.value)}
            placeholder="e.g., calculus, derivatives, important"
          />
        </div>

        {/* Editor */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Markdown Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Markdown Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={content}
                onChange={(e) => handleChange("content", e.target.value)}
                className="w-full h-96 p-4 border border-border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="# Heading\n\n## Subheading\n\n- Bullet point\n- Another point\n\n**Bold text** and *italic text*"
              />
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <div className="h-96 overflow-y-auto p-4 bg-muted rounded-lg">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{content}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
