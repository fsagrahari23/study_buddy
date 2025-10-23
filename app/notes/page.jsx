"use client"

import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addNote, deleteNote } from "@/lib/slices/notesSlice"
import { Plus, FileText, Trash2 } from "lucide-react"
import Link from "next/link"

export default function NotesPage() {
  const dispatch = useDispatch()
  const notes = useSelector((state) => state.notes.notes)
  const [showNewNote, setShowNewNote] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState("")

  const handleCreateNote = () => {
    if (newNoteTitle.trim()) {
      const newNote = {
        id: Date.now().toString(),
        title: newNoteTitle,
        content: "# Start typing...\n\nYour note content goes here.",
        tags: [],
        createdAt: new Date(),
      }
      dispatch(addNote(newNote))
      setNewNoteTitle("")
      setShowNewNote(false)
    }
  }

  const handleDeleteNote = (id) => {
    if (confirm("Are you sure you want to delete this note?")) {
      dispatch(deleteNote(id))
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notes</h1>
            <p className="text-muted-foreground">Create and manage your study notes</p>
          </div>
          <Button onClick={() => setShowNewNote(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* New Note Form */}
        {showNewNote && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Note Title</label>
                <Input
                  placeholder="e.g., Calculus Chapter 5"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateNote} className="flex-1">
                  Create Note
                </Button>
                <Button variant="outline" onClick={() => setShowNewNote(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Card key={note.id} className="hover:border-primary transition-colors flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">{note.content}</p>
                <div className="flex gap-2 flex-wrap mb-4">
                  {note.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Link href={`/notes/${note.id}`} className="flex-1">
                    <Button className="w-full" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {notes.length === 0 && !showNewNote && (
            <Card className="col-span-full p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No notes yet. Create one to get started.</p>
              <Button onClick={() => setShowNewNote(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Note
              </Button>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
