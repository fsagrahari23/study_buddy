"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addMessage } from "@/lib/slices/chatsSlice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader } from "lucide-react"

export function ChatPanel({ fileId, chatId }) {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const chat = useSelector((state) => state.chats.chats.find((c) => c.id === chatId))

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    setLoading(true)

    // Add user message
    dispatch(
      addMessage({
        chatId,
        message: { role: "user", text: message },
      }),
    )

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "This is a great question! Based on the document, the answer is...",
        "According to the material, we can see that...",
        "That's an interesting point. The document explains that...",
        "Looking at the relevant section, it states that...",
      ]

      const randomResponse = responses[Math.floor(Math.random() * responses.length)]

      dispatch(
        addMessage({
          chatId,
          message: {
            role: "assistant",
            text: randomResponse,
            sources: [
              {
                fileId,
                page: Math.floor(Math.random() * 245) + 1,
                excerpt: "Relevant text from the document...",
              },
            ],
          },
        }),
      )

      setLoading(false)
    }, 1000)

    setMessage("")
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 md:pb-3">
        <CardTitle className="text-base md:text-lg">Ask Questions</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-2 md:p-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-3 md:mb-4 space-y-3 md:space-y-4 pr-2">
          {chat?.messages?.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-foreground rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-current/20 text-xs">
                    <p className="font-semibold mb-1">Sources:</p>
                    {msg.sources.map((source, sidx) => (
                      <p key={sidx}>Page {source.page}</p>
                    ))}
                  </div>
                )}
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
            placeholder="Ask a question..."
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
  )
}
