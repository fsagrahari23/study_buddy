"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Sparkles, Copy, Share2, Loader, Send } from "lucide-react"
import { logEvent } from "@/lib/slices/eventsSlice"

const AI_TOOLS = [
  {
    id: "explain",
    name: "Explain Concept",
    description: "Get detailed explanation",
    icon: "📚",
  },
  {
    id: "summary",
    name: "Generate Summary",
    description: "Create concise summary",
    icon: "✨",
  },
  {
    id: "questions",
    name: "Practice Questions",
    description: "Generate test questions",
    icon: "❓",
  },
  {
    id: "flashcards",
    name: "Create Flashcards",
    description: "Make study cards",
    icon: "🎴",
  },
]

export default function NoteDetailPage() {
  const router = useRouter()
  const params = useParams()
  const dispatch = useDispatch()
  const selectedNote = useSelector((state) => state.events.selectedNote)
  const [selectedTool, setSelectedTool] = useState(null)
  const [aiResponse, setAiResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [userMessage, setUserMessage] = useState("")
  const [messages, setMessages] = useState([])

  const note = selectedNote || {
    id: params.noteId,
    title: "Note",
    content: "Loading...",
    category: "General",
    tags: [],
    readTime: "2 min",
  }

  const handleToolClick = async (toolId) => {
    setSelectedTool(toolId)
    setLoading(true)
    setAiResponse("")

    try {
      let response
      let apiEndpoint

      switch (toolId) {
        case "explain":
          apiEndpoint = "/api/notes/explain"
          break
        case "summary":
          apiEndpoint = "/api/notes/summary"
          break
        case "questions":
          apiEndpoint = "/api/notes/questions"
          break
        case "flashcards":
          // For flashcards, we need a deckId - for now, we'll use a default or prompt user
          // This might need to be updated to get deckId from user selection
          apiEndpoint = "/api/notes/flashcards"
          break
        default:
          throw new Error("Unknown tool")
      }

      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noteId: note.id,
          ...(toolId === "flashcards" && { deckId: "default-deck-id" }), // TODO: Get actual deckId
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await res.json()

      switch (toolId) {
        case "explain":
          response = data.explanation
          break
        case "summary":
          response = data.summary
          break
        case "questions":
          response = data.questions
          break
        case "flashcards":
          response = data.message
          break
      }

      setAiResponse(response)
      setMessages([
        ...messages,
        {
          role: "user",
          text: `${AI_TOOLS.find((t) => t.id === toolId)?.name} for this note`,
        },
        {
          role: "assistant",
          text: response,
        },
      ])
    } catch (error) {
      console.error("Error calling AI API:", error)
      setAiResponse("Sorry, there was an error processing your request. Please try again.")
      setMessages([
        ...messages,
        {
          role: "user",
          text: `${AI_TOOLS.find((t) => t.id === toolId)?.name} for this note`,
        },
        {
          role: "assistant",
          text: "Sorry, there was an error processing your request. Please try again.",
        },
      ])
    } finally {
      setLoading(false)
      dispatch(logEvent({ type: "ai_tool_used", toolId, noteId: note.id }))
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!userMessage.trim()) return

    setMessages([...messages, { role: "user", text: userMessage }])
    setLoading(true)

    setTimeout(() => {
      const aiResponse = `Based on your question about "${userMessage}", here's what I found:

This is a great question! Let me provide you with a comprehensive answer:

1. **Direct Answer**: The answer relates to the core concept of ${note.title}

2. **Detailed Explanation**: 
   - First aspect: ...
   - Second aspect: ...
   - Third aspect: ...

3. **Examples**: 
   - Example 1: ...
   - Example 2: ...

4. **Related Concepts**: This connects to...

5. **Study Tip**: To master this, try...

Feel free to ask follow-up questions!`

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: aiResponse,
        },
      ])
      setLoading(false)
      setUserMessage("")
      dispatch(logEvent({ type: "ai_question_asked", noteId: note.id, question: userMessage }))
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="w-full space-y-4 md:space-y-6">
        {/* Header with Back Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-1 h-auto">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">{note.title}</h1>
              <p className="text-xs md:text-sm text-muted-foreground">{note.category}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2 bg-transparent">
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Copy</span>
            </Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2 bg-transparent">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>

        {/* Main Content Grid - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Note Content */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Note Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 md:p-6 rounded-lg">
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">{note.content}</p>
                </div>
              </CardContent>
            </Card>

            {/* AI Chat Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  AI Assistant Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Chat Messages */}
                <div className="bg-muted/30 rounded-lg p-3 md:p-4 h-64 md:h-80 overflow-y-auto space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <p className="text-sm text-muted-foreground">
                        Select a tool or ask a question to start chatting with AI
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-xs md:max-w-md px-3 md:px-4 py-2 rounded-lg text-sm ${msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted text-foreground rounded-bl-none"
                            }`}
                        >
                          <p className="break-words">{msg.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-muted text-foreground px-3 md:px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Ask anything about this note..."
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    disabled={loading}
                    className="text-sm"
                  />
                  <Button type="submit" disabled={loading || !userMessage.trim()} size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* AI Tools Sidebar - Responsive */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">AI Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {AI_TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.id)}
                    disabled={loading}
                    className={`w-full p-3 rounded-lg border transition-all text-left text-sm ${selectedTool === tool.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                      } disabled:opacity-50`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{tool.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs md:text-sm">{tool.name}</p>
                        <p className="text-xs text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
