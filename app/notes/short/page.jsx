"use client"

import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Trash2, Clock, ArrowRight, Loader } from "lucide-react"
import { selectNote, logEvent } from "@/lib/slices/eventsSlice"

export default function ShortNotesPage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [shortNotes, setShortNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [newNoteContent, setNewNoteContent] = useState("")
  const [creatingNote, setCreatingNote] = useState(false)

  const categories = ["All", "Biology", "Physics", "Mathematics", "Chemistry", "History"]

  // Fetch short notes on component mount
  useEffect(() => {
    fetchShortNotes()
  }, [])

  const fetchShortNotes = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/notes/short')
      if (!response.ok) {
        throw new Error('Failed to fetch short notes')
      }
      const data = await response.json()
      setShortNotes(data.notes || [])
    } catch (error) {
      console.error('Error fetching short notes:', error)
      setError('Failed to load short notes')
    } finally {
      setLoading(false)
    }
  }

  const filteredNotes = shortNotes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || note.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return

    try {
      setCreatingNote(true)
      const response = await fetch('/api/notes/short', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newNoteTitle,
          content: newNoteContent,
          category: selectedCategory === "All" ? "General" : selectedCategory,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create note')
      }

      const data = await response.json()
      setShortNotes([data.note, ...shortNotes])
      setNewNoteTitle("")
      setNewNoteContent("")
      setShowNewNoteDialog(false)
    } catch (error) {
      console.error('Error creating note:', error)
      setError('Failed to create note')
    } finally {
      setCreatingNote(false)
    }
  }

  const handleDeleteNote = async (id) => {
    try {
      const response = await fetch(`/api/notes/short/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete note')
      }

      setShortNotes(shortNotes.filter((note) => note._id !== id))
    } catch (error) {
      console.error('Error deleting note:', error)
      setError('Failed to delete note')
    }
  }

  const handleNoteClick = (note) => {
    dispatch(selectNote(note))
    dispatch(logEvent({ type: "note_viewed", noteId: note.id, noteTitle: note.title }))
    router.push(`/notes/short/${note.id}`)
  }

  return (
    <DashboardLayout>
      <div className="w-full space-y-4 md:space-y-6">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold">Short Notes</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">Quick reference notes for fast learning</p>
          </div>
          <Dialog open={showNewNoteDialog} onOpenChange={setShowNewNoteDialog}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto gap-2">
                <Plus className="w-4 h-4" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:w-full">
              <DialogHeader>
                <DialogTitle>Create Short Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Note title..."
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <textarea
                    placeholder="Write your short note here..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full h-32 p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                  />
                </div>
                <Button onClick={handleAddNote} className="w-full" disabled={creatingNote}>
                  {creatingNote ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Note'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter - Responsive */}
        <div className="space-y-3 md:space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm md:text-base"
            />
          </div>

          {/* Category Filter - Responsive */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 md:px-4 py-2 rounded-full whitespace-nowrap text-sm transition-colors ${selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading short notes...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <p className="text-destructive text-sm md:text-base">{error}</p>
            <Button onClick={fetchShortNotes} className="mt-4">
              Try Again
            </Button>
          </div>
        )}

        {/* Notes Grid - Fully Responsive */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <Card
                  key={note._id}
                  className="hover:shadow-lg transition-all cursor-pointer group overflow-hidden hover:border-primary/50"
                  onClick={() => handleNoteClick(note)}
                >
                  <CardHeader className="pb-2 md:pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors">
                          {note.title}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{note.category}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteNote(note._id)
                        }}
                        className="p-1 rounded hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 md:space-y-3">
                    <p className="text-xs md:text-sm text-foreground line-clamp-3 leading-relaxed">{note.content}</p>

                    {/* Tags */}
                    {note.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {note.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                        {note.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{note.tags.length - 2}</span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {note.readTime}
                      </div>
                      <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-medium">View</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 md:py-12">
                <p className="text-muted-foreground text-sm md:text-base">No notes found</p>
                <Button onClick={() => setShowNewNoteDialog(true)} className="mt-4">
                  Create your first note
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>

  )
}
