"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, Loader, BookOpen, Lightbulb, HelpCircle, Sparkles } from "lucide-react"

export default function NoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const noteId = params.noteId

  // Mock note data
  const mockNotes = {
    1: {
      id: "1",
      title: "Photosynthesis Process",
      content: `Photosynthesis is the process by which plants convert light energy into chemical energy. It occurs in two main stages: the light-dependent reactions and the light-independent reactions (Calvin cycle).

Light-Dependent Reactions:
- Occur in the thylakoid membrane
- Require light energy
- Produce ATP and NADPH
- Release oxygen as a byproduct

Light-Independent Reactions (Calvin Cycle):
- Occur in the stroma
- Do not require light directly
- Use ATP and NADPH from light reactions
- Produce glucose

The overall equation: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2`,
      category: "Biology",
      createdAt: new Date("2024-10-20"),
    },
    2: {
      id: "2",
      title: "Newton's Laws of Motion",
      content: `Newton's Laws of Motion are fundamental principles in classical mechanics.

First Law (Law of Inertia):
An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.

Second Law (F=ma):
The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.

Third Law (Action-Reaction):
For every action, there is an equal and opposite reaction.

Applications:
- Rocket propulsion
- Vehicle dynamics
- Sports physics`,
      category: "Physics",
      createdAt: new Date("2024-10-19"),
    },
  }

  const note = mockNotes[noteId] || mockNotes["1"]
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const [selectedTool, setSelectedTool] = useState(null)

  const tools = [
    { id: "explain", label: "Explain", icon: BookOpen, color: "bg-blue-500/10 text-blue-600" },
    { id: "summary", label: "Summary", icon: Lightbulb, color: "bg-yellow-500/10 text-yellow-600" },
    { id: "questions", label: "Questions", icon: HelpCircle, color: "bg-purple-500/10 text-purple-600" },
    { id: "flashcards", label: "Flashcards", icon: Sparkles, color: "bg-pink-500/10 text-pink-600" },
  ]

  const handleToolClick = (toolId) => {
    setSelectedTool(toolId)
    const toolPrompts = {
      explain: `Explain this topic in detail: ${note.title}`,
      summary: `Provide a concise summary of: ${note.title}`,
      questions: `Generate 5 study questions about: ${note.title}`,
      flashcards: `Create 5 flashcard pairs for: ${note.title}`,
    }
    setMessage(toolPrompts[toolId])
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    setLoading(true)

    // Add user message
    setMessages((prev) => [...prev, { role: "user", text: message }])

    // Simulate AI response
    setTimeout(() => {
      const responses = {
        explain: `Here's a detailed explanation of ${note.title}:\n\n${note.content}\n\nThis concept is important because it forms the foundation for understanding more complex topics in this field.`,
        summary: `Summary of ${note.title}:\n\n${note.content.split("\n").slice(0, 3).join("\n")}\n\nKey takeaway: This is a fundamental concept that you should master.`,
        questions: `Study Questions:\n1. What is ${note.title}?\n2. How does it work?\n3. What are the main components?\n4. What are real-world applications?\n5. How does it relate to other concepts?`,
        flashcards: `Flashcard Pairs:\n1. Q: Definition of ${note.title}\n   A: [See content above]\n2. Q: Main components\n   A: [Listed in content]\n3. Q: Applications\n   A: [Practical uses]\n4. Q: Historical significance\n   A: [Important context]\n5. Q: Related concepts\n   A: [Connected topics]`,
      }

      const response =
        responses[selectedTool] ||
        "I can help you understand this topic better. What specific aspect would you like to explore?"

      setMessages((prev) => [...prev, { role: "assistant", text: response }])
      setLoading(false)
    }, 1000)

    setMessage("")
    setSelectedTool(null)
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-xs md:text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{note.title}</h1>
              <p className="text-xs md:text-sm text-muted-foreground">{note.category}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Note Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Note Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                  <p className="text-sm md:text-base whitespace-pre-wrap text-foreground leading-relaxed">
                    {note.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Tools & Chat */}
          <div className="lg:col-span-1 space-y-4">
            {/* Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">AI Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tools.map((tool) => (
                  <Button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.id)}
                    variant={selectedTool === tool.id ? "default" : "outline"}
                    className={`w-full justify-start text-xs md:text-sm ${selectedTool === tool.id ? "" : tool.color}`}
                  >
                    <tool.icon className="w-4 h-4 mr-2" />
                    {tool.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Chat */}
            <Card className="flex flex-col h-[400px] md:h-[500px]">
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-base md:text-lg">Ask AI</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-2 md:p-4">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-3 md:mb-4 space-y-3 md:space-y-4 pr-2">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted text-foreground rounded-bl-none"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-muted text-foreground px-3 md:px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-2 text-xs md:text-sm">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Ask about this note..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={loading}
                    className="text-xs md:text-sm"
                  />
                  <Button type="submit" disabled={loading || !message.trim()} size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
