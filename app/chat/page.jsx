"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { addMessageToFileChat } from "@/lib/slices/chatsSlice"
import { Send, Loader, Sparkles, BookOpen, Lightbulb, HelpCircle, Brain, Zap, MessageSquare, Plus, Trash2, Wrench } from "lucide-react"

const CHAT_TOOLS = [
  {
    id: "explain",
    name: "Explain Concept",
    description: "Get detailed explanation of any concept",
    icon: BookOpen,
    color: "bg-blue-500/10 border-blue-500/20",
    prompt: "Explain this concept in detail with examples:",
  },
  {
    id: "solve",
    name: "Solve Problem",
    description: "Get step-by-step solution",
    icon: Brain,
    color: "bg-purple-500/10 border-purple-500/20",
    prompt: "Solve this problem step by step:",
  },
  {
    id: "summarize",
    name: "Summarize",
    description: "Get concise summary of topic",
    icon: Zap,
    color: "bg-yellow-500/10 border-yellow-500/20",
    prompt: "Summarize this topic concisely:",
  },
  {
    id: "tips",
    name: "Study Tips",
    description: "Get effective study strategies",
    icon: Lightbulb,
    color: "bg-green-500/10 border-green-500/20",
    prompt: "Provide study tips for:",
  },
  {
    id: "compare",
    name: "Compare Topics",
    description: "Compare two concepts",
    icon: MessageSquare,
    color: "bg-pink-500/10 border-pink-500/20",
    prompt: "Compare and contrast:",
  },
  {
    id: "practice",
    name: "Practice Questions",
    description: "Generate practice questions",
    icon: HelpCircle,
    color: "bg-orange-500/10 border-orange-500/20",
    prompt: "Generate practice questions for:",
  },
]

export default function ChatPage() {
  const dispatch = useDispatch()
  const chats = useSelector((state) => state.chats.chats)
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedTool, setSelectedTool] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [currentChat, setCurrentChat] = useState(null)

  useEffect(() => {
    fetchChats()
  }, [])

  const fetchChats = async () => {
    try {
      const response = await fetch("/api/chat")
      if (response.ok) {
        const data = await response.json()
        setChatHistory(data.chats || [])
        if (data.chats && data.chats.length > 0 && !selectedChatId) {
          setSelectedChatId(data.chats[0]._id)
          loadChat(data.chats[0]._id)
        }
      }
    } catch (error) {
      console.error("Error fetching chats:", error)
    }
  }

  const loadChat = async (chatId) => {
    try {
      const response = await fetch(`/api/chat?chatId=${chatId}`)
      if (response.ok) {
        const data = await response.json()
        setCurrentChat(data.chat)
        setSelectedChatId(chatId)
      }
    } catch (error) {
      console.error("Error loading chat:", error)
    }
  }

  const createNewChat = () => {
    const newChatId = `chat_${Date.now()}`
    setSelectedChatId(newChatId)
    setCurrentChat({
      _id: newChatId,
      title: "New Chat",
      messages: [],
    })
    setChatHistory(prev => [{
      _id: newChatId,
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }, ...prev])
  }

  const deleteChat = async (chatId) => {
    try {
      const response = await fetch(`/api/chat?chatId=${chatId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setChatHistory(prev => prev.filter(chat => chat._id !== chatId))
        if (selectedChatId === chatId) {
          const remainingChats = chatHistory.filter(chat => chat._id !== chatId)
          if (remainingChats.length > 0) {
            setSelectedChatId(remainingChats[0]._id)
            loadChat(remainingChats[0]._id)
          } else {
            setSelectedChatId(null)
            setCurrentChat(null)
          }
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error)
    }
  }

  const handleSendMessage = async (e, toolId = null) => {
    e.preventDefault()
    if (!message.trim() || !selectedChatId) return

    const tool = CHAT_TOOLS.find((t) => t.id === toolId)
    const fullMessage = tool ? `${tool.prompt} ${message}` : message

    setLoading(true)

    // Add user message to local state
    const userMessage = {
      role: "user",
      content: fullMessage,
      tool: toolId,
      timestamp: new Date(),
    }

    setCurrentChat(prev => ({
      ...prev,
      messages: [...(prev?.messages || []), userMessage],
    }))

    try {
      // Send to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: fullMessage,
          chatId: selectedChatId,
          toolId,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Add AI response to local state
        const aiMessage = {
          role: "assistant",
          content: data.response,
          tool: toolId,
          timestamp: new Date(),
        }

        setCurrentChat(prev => ({
          ...prev,
          messages: [...(prev?.messages || []), aiMessage],
        }))

        // Update chat history
        setChatHistory(prev =>
          prev.map(chat =>
            chat._id === selectedChatId
              ? { ...chat, messages: [...chat.messages, userMessage, aiMessage] }
              : chat
          )
        )
      } else {
        console.error("Failed to get AI response")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }

    setLoading(false)
    setMessage("")
    setSelectedTool(null)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Study Assistant</h1>
            <p className="text-muted-foreground mt-1">Get help with any study topic</p>
          </div>
          <Button onClick={createNewChat} className="gap-2">
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        {/* Main Chat Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Sidebar - Chat History */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">Chats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {chatHistory.map((chat) => (
                  <div key={chat._id} className="flex items-center gap-2">
                    <button
                      onClick={() => loadChat(chat._id)}
                      className={`flex-1 text-left px-3 py-2 rounded-lg transition-colors text-sm ${selectedChatId === chat._id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                        }`}
                    >
                      <p className="font-medium truncate">{chat.title}</p>
                      <p className="text-xs opacity-70">{chat.messages?.length || 0} messages</p>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteChat(chat._id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Chat */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6 order-1 lg:order-2">
            {/* Chat Messages */}
            <Card className="h-64 md:h-96 flex flex-col">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  <span className="truncate">{currentChat?.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-4 py-4">
                {currentChat?.messages?.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs md:max-w-md px-3 md:px-4 py-2 md:py-3 rounded-lg text-sm ${msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted text-foreground rounded-bl-none"
                        }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.content}</p>
                      {msg.tool && (
                        <div className="mt-2 pt-2 border-t border-current/20 text-xs opacity-70">
                          Tool: {CHAT_TOOLS.find((t) => t.id === msg.tool)?.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground px-3 md:px-4 py-2 md:py-3 rounded-lg rounded-bl-none flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tool Panel */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  <Wrench className="w-4 h-4" />
                  Quick Tools
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto max-h-[80vh]">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Select a Tool</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {CHAT_TOOLS.map((tool) => {
                      const Icon = tool.icon
                      return (
                        <button
                          key={tool.id}
                          onClick={() => {
                            setSelectedTool(tool.id)
                            setSheetOpen(false)
                          }}
                          className={`p-3 rounded-lg border transition-all hover:shadow-md text-sm ${tool.color} ${selectedTool === tool.id ? "ring-2 ring-primary" : ""
                            }`}
                        >
                          <Icon className="w-5 h-5 mb-2" />
                          <p className="text-xs font-medium text-left line-clamp-2">{tool.name}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Input Area - Responsive */}
            <form onSubmit={(e) => handleSendMessage(e, selectedTool)} className="space-y-2 md:space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder={
                    selectedTool
                      ? `${CHAT_TOOLS.find((t) => t.id === selectedTool)?.description}...`
                      : "Ask anything about your studies..."
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                  className="text-sm"
                />
                <Button type="submit" disabled={loading || !message.trim()} size="sm" className="px-2 md:px-4">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {selectedTool && (
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4" />
                  <span className="truncate">Using: {CHAT_TOOLS.find((t) => t.id === selectedTool)?.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTool(null)}
                    className="text-xs text-primary hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
