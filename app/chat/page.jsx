"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addMessage } from "@/lib/slices/chatsSlice"
import { Send, Loader, Sparkles, BookOpen, Lightbulb, HelpCircle, Brain, Zap, MessageSquare, Plus } from "lucide-react"

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
  const [selectedChatId, setSelectedChatId] = useState(chats[0]?.id || "1")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedTool, setSelectedTool] = useState(null)

  const currentChat = chats.find((c) => c.id === selectedChatId)

  const handleSendMessage = async (e, toolId = null) => {
    e.preventDefault()
    if (!message.trim()) return

    const tool = CHAT_TOOLS.find((t) => t.id === toolId)
    const fullMessage = tool ? `${tool.prompt} ${message}` : message

    setLoading(true)

    // Add user message
    dispatch(
      addMessage({
        chatId: selectedChatId,
        message: { role: "user", text: fullMessage, tool: toolId },
      }),
    )

    // Simulate AI response
    setTimeout(() => {
      const responses = {
        explain: `This is an excellent question! Let me break this down for you:

1. **Core Concept**: The fundamental principle here is...
2. **How It Works**: The mechanism involves...
3. **Real-World Example**: Consider this scenario...
4. **Key Takeaways**: Remember these important points...

This concept is crucial for understanding more advanced topics in this field.`,
        solve: `Let me solve this step by step:

**Step 1**: Identify what we know
- Given information: ...
- What we need to find: ...

**Step 2**: Choose the right approach
- Method: ...
- Formula: ...

**Step 3**: Apply the solution
- Calculation: ...
- Result: ...

**Step 4**: Verify the answer
- Check: ...
- Conclusion: ...

The final answer is: **[Result]**`,
        summarize: `Here's a concise summary:

**Main Points**:
• Point 1: ...
• Point 2: ...
• Point 3: ...

**Key Takeaway**: The most important thing to remember is...

**Why It Matters**: This concept is important because...`,
        tips: `Here are effective study strategies:

1. **Active Recall**: Test yourself regularly without looking at notes
2. **Spaced Repetition**: Review material at increasing intervals
3. **Teach Others**: Explain concepts to someone else
4. **Practice Problems**: Work through examples and exercises
5. **Create Visuals**: Make mind maps and diagrams
6. **Group Study**: Collaborate with peers for deeper understanding`,
        compare: `Here's a detailed comparison:

**Similarities**:
- Both share...
- Common aspects include...

**Differences**:
- Concept A emphasizes...
- Concept B focuses on...

**When to Use Each**:
- Use A when...
- Use B when...

**Relationship**: These concepts are related because...`,
        practice: `Here are practice questions:

1. **Easy**: [Question about basic understanding]
2. **Medium**: [Question requiring application]
3. **Hard**: [Question requiring analysis]
4. **Challenge**: [Question requiring synthesis]

Try solving these and check your understanding!`,
      }

      const response = responses[toolId] || responses.explain

      dispatch(
        addMessage({
          chatId: selectedChatId,
          message: {
            role: "assistant",
            text: response,
            tool: toolId,
          },
        }),
      )

      setLoading(false)
    }, 1500)

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
          <Button className="gap-2">
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
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                      selectedChatId === chat.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <p className="font-medium truncate">{chat.title}</p>
                    <p className="text-xs opacity-70">{chat.messages.length} messages</p>
                  </button>
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
                      className={`max-w-xs md:max-w-md px-3 md:px-4 py-2 md:py-3 rounded-lg text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted text-foreground rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.text}</p>
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

            {/* Tools Grid - Responsive */}
            <div>
              <p className="text-sm font-medium mb-3">Quick Tools</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                {CHAT_TOOLS.map((tool) => {
                  const Icon = tool.icon
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setSelectedTool(tool.id)}
                      className={`p-2 md:p-3 rounded-lg border transition-all hover:shadow-md text-sm ${tool.color} ${
                        selectedTool === tool.id ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <Icon className="w-4 md:w-5 h-4 md:h-5 mb-1 md:mb-2" />
                      <p className="text-xs font-medium text-left line-clamp-2">{tool.name}</p>
                    </button>
                  )
                })}
              </div>
            </div>

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
