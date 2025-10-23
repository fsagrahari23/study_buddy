"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Trash2, Clock, ArrowRight } from "lucide-react"
import { selectNote, addEvent } from "@/lib/slices/eventsSlice"

// Mock short notes data
const SAMPLE_SHORT_NOTES = [
  {
    id: "short-1",
    title: "Photosynthesis Process",
    content:
      "Light reactions occur in thylakoid membrane. Dark reactions (Calvin cycle) occur in stroma. Produces glucose and oxygen.",
    category: "Biology",
    tags: ["photosynthesis", "biology", "energy"],
    createdAt: new Date("2024-10-20"),
    readTime: "2 min",
  },
  {
    id: "short-2",
    title: "Newton's Laws Summary",
    content: "1st Law: Object at rest stays at rest. 2nd Law: F=ma. 3rd Law: Action-reaction pairs.",
    category: "Physics",
    tags: ["newton", "physics", "mechanics"],
    createdAt: new Date("2024-10-19"),
    readTime: "3 min",
  },
  {
    id: "short-3",
    title: "Quadratic Formula",
    content: "x = (-b ± √(b²-4ac)) / 2a. Used to solve quadratic equations ax²+bx+c=0.",
    category: "Mathematics",
    tags: ["algebra", "quadratic", "formula"],
    createdAt: new Date("2024-10-18"),
    readTime: "2 min",
  },
  {
    id: "short-4",
    title: "Mitochondria Function",
    content: "Powerhouse of cell. Produces ATP through cellular respiration. Contains own DNA and ribosomes.",
    category: "Biology",
    tags: ["cell", "mitochondria", "energy"],
    createdAt: new Date("2024-10-17"),
    readTime: "2 min",
  },
  {
    id: "short-5",
    title: "Photosynthesis Equation",
    content: "6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. Overall equation for photosynthesis.",
    category: "Biology",
    tags: ["photosynthesis", "equation", "chemistry"],
    createdAt: new Date("2024-10-16"),
    readTime: "2 min",
  },
  {
    id: "short-6",
    title: "Atomic Structure",
    content: "Atoms consist of protons, neutrons, and electrons. Nucleus contains protons and neutrons.",
    category: "Chemistry",
    tags: ["atoms", "chemistry", "structure"],
    createdAt: new Date("2024-10-15"),
    readTime: "2 min",
  },
]

export default function ShortNotesPage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [shortNotes, setShortNotes] = useState(SAMPLE_SHORT_NOTES)
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [newNoteContent, setNewNoteContent] = useState("")

  const categories = ["All", "Biology", "Physics", "Mathematics", "Chemistry", "History"]

  const filteredNotes = shortNotes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || note.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddNote = () => {
    if (newNoteTitle.trim() && newNoteContent.trim()) {
      const newNote = {
        id: `short-${Date.now()}`,
        title: newNoteTitle,
        content: newNoteContent,
        category: selectedCategory === "All" ? "General" : selectedCategory,
        tags: [],
        createdAt: new Date(),
        readTime: "2 min",
      }
      setShortNotes([newNote, ...shortNotes])
      setNewNoteTitle("")
      setNewNoteContent("")
      setShowNewNoteDialog(false)
    }
  }

  const handleDeleteNote = (id) => {
    setShortNotes(shortNotes.filter((note) => note.id !== id))
  }

  const handleNoteClick = (note) => {
    dispatch(selectNote(note))
    dispatch(addEvent({ type: "note_viewed", noteId: note.id, noteTitle: note.title }))
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
                <Button onClick={handleAddNote} className="w-full">
                  Create Note
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
                className={`px-3 md:px-4 py-2 rounded-full whitespace-nowrap text-sm transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Grid - Fully Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <Card
                key={note.id}
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
                        handleDeleteNote(note.id)
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
      </div>
    </DashboardLayout>
  )
}
