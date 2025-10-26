"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { marked } from 'marked'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader } from "lucide-react"
import { loadFileChat, addMessageToFileChat, saveFileChat } from "@/lib/slices/chatsSlice"

export function ChatPanel({ fileId, pineconeID }) {
  const dispatch = useDispatch()
  const messages = useSelector((state) => {
    const chat = state.chats.chats.find(chat => chat.id === fileId)
    return chat ? chat.messages : []
  })
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  // Load messages from Redux/localStorage on mount or fileId change
  useEffect(() => {
    dispatch(loadFileChat({ fileId }))
  }, [fileId, dispatch])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || !pineconeID) return

    setLoading(true)
    setIsTyping(true)

    // Add user message
    const userMessage = { role: "user", text: message, timestamp: new Date().toISOString() }
    dispatch(addMessageToFileChat({ fileId, message: userMessage }))

    try {
      // Call the API
      const response = await fetch('https://helper-function-103741319333.us-central1.run.app/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pineconeID: pineconeID,
          query: message,
        }),
      })

      if (!response.ok) {
        throw new Error('API call failed')
      }

      const data = await response.json()

      // Add AI response
      const aiMessage = {
        role: "assistant",
        text: data.answer || "Sorry, I couldn't generate a response.",
        timestamp: new Date().toISOString(),
        sources: data.sources || []
      }
      dispatch(addMessageToFileChat({ fileId, message: aiMessage }))

    } catch (error) {
      console.error('Error calling chat API:', error)
      // Add error message
      const errorMessage = {
        role: "assistant",
        text: "Sorry, there was an error processing your question. Please try again.",
        timestamp: new Date().toISOString()
      }
      dispatch(addMessageToFileChat({ fileId, message: errorMessage }))
    } finally {
      setLoading(false)
      setIsTyping(false)
      setMessage("")
      dispatch(saveFileChat({ fileId }))
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 md:pb-3">
        <CardTitle className="text-base md:text-lg">Ask Questions</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-2 md:p-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-3 md:mb-4 space-y-3 md:space-y-4 pr-2">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm ${msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-muted text-foreground rounded-bl-none"
                  }`}
              >
                {msg.role === "assistant" ? (
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-pre:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-blockquote:my-2 prose-code:px-1 prose-code:py-0.5 prose-code:bg-muted prose-code:rounded prose-code:text-xs prose-pre:bg-muted prose-pre:rounded prose-pre:p-2 prose-pre:text-xs overflow-hidden break-words"
                    dangerouslySetInnerHTML={{ __html: marked(msg.text) }}
                  />
                ) : (
                  <p className="break-words">{msg.text}</p>
                )}
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
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground px-3 md:px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-2 text-xs md:text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span>AI is typing...</span>
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
