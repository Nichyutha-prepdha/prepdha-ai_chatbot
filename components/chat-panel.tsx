"use client"

import { useState, useRef, useEffect } from "react"
import { Send, X, FileText, ChevronLeft } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  time: string
  reference?: string
  image?: string
}

interface ChatPanelProps {
  messages: Message[]
  onSendMessage: (text: string) => void
  suggestions: string[]
  contextReference: string | null
  onClearReference: () => void
  title: string
  onOpenHistory: () => void
}

export function ChatPanel({
  messages,
  onSendMessage,
  suggestions,
  contextReference,
  onClearReference,
  title,
  onOpenHistory,
}: ChatPanelProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    onSendMessage(input.trim())
    setInput("")
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onOpenHistory}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="View chat history"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] font-medium">
            New
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === "user" ? (
              <div className="flex flex-col items-end gap-1">
                {msg.reference && (
                  <div className="max-w-[85%] px-3 py-2 rounded-lg bg-[#7c3aed]/10 text-xs text-[#7c3aed] border border-[#7c3aed]/20">
                    <span className="font-medium">Reference: </span>
                    {msg.reference}
                  </div>
                )}
                <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-br-md bg-[#7c3aed] text-white text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {msg.time}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-1">
                {msg.image && (
                  <div className="max-w-[85%] rounded-lg overflow-hidden border border-border">
                    <img
                      src={msg.image}
                      alt="AI shared reference"
                      className="w-full h-auto"
                    />
                  </div>
                )}
                <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-muted text-foreground text-sm leading-relaxed">
                  {msg.content ? (
                    <div className="[&_*]:last:mb-0 [&_strong]:font-bold [&_p]:mb-2 [&_p]:last:mb-0 [&_ol]:mb-2 [&_ol]:last:mb-0 [&_li]:mb-1 [&_li]:last:mb-0">
                      <ReactMarkdown
                        components={{
                          // Ensure numbered lists are rendered correctly
                          ol: ({children}) => <ol className="list-decimal list-inside space-y-1">{children}</ol>,
                          li: ({children}) => <li>{children}</li>
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70 animate-bounce [animation-delay:-0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70 animate-bounce [animation-delay:-0.1s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70 animate-bounce" />
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {msg.time}
                </span>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && messages.length <= 2 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onSendMessage(suggestion)}
              className="px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Context Reference */}
      {contextReference && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
            <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-xs text-amber-700 truncate flex-1">
              {contextReference}
            </span>
            <button
              onClick={onClearReference}
              className="shrink-0 text-amber-500 hover:text-amber-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card focus-within:ring-2 focus-within:ring-[#7c3aed]/20 focus-within:border-[#7c3aed] transition-colors">
          <input
            type="text"
            placeholder="Ask anything about this chapter"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* AI Summary Panel (default state) */
interface AISummaryPanelProps {
  onSendMessage: (text: string) => void
  contextReference: string | null
  onClearReference: () => void
  onOpenHistory: () => void
  chapterId?: string | null
}

export function AISummaryPanel({
  onSendMessage,
  contextReference,
  onClearReference,
  onOpenHistory,
  chapterId,
}: AISummaryPanelProps) {
  const [input, setInput] = useState("")

  const summaryText =
    chapterId === "chapter-1"
      ? "This chapter introduces Harsha's early military campaigns and how he began expanding his rule."
      : chapterId === "chapter-2"
      ? "This chapter explains Harsha's first expedition against Sasanka and how it set the stage for later conflicts."
      : chapterId === "chapter-3"
      ? "This chapter covers the conquest of Gauda after Sasanka's death and the shift in regional power."
      : chapterId === "chapter-4"
      ? "This chapter focuses on the conquest of Magadha and why controlling it strengthened Harsha's empire."
      : chapterId === "chapter-5"
      ? "This chapter looks at architecture and monuments under Harsha and how they built his empire's legacy."
      : "This chapter discusses the selected topic and how it fits into Harsha's campaigns and rule."

  const handleSend = () => {
    if (!input.trim()) return
    onSendMessage(input.trim())
    setInput("")
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHistory}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="View chat history"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-foreground">Chat</span>
        </div>
      </div>

      {/* AI Summary Card */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-foreground leading-relaxed">
            <span className="font-semibold text-[#7c3aed]">AI Summary: </span>
            {summaryText}
          </p>
          <button
            onClick={() => onSendMessage("Summarize topic")}
            className="mt-3 px-3 py-1.5 rounded-full bg-amber-400 text-amber-900 text-xs font-semibold hover:bg-amber-500 transition-colors"
          >
            Summarize topic
          </button>
        </div>

        {/* Quick action suggestions */}
        <div className="mt-auto pt-6 flex flex-wrap gap-2">
          <button
            onClick={() => onSendMessage("Explain this slowly step by step")}
            className="px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Step‑by‑step explanation
          </button>
          <button
            onClick={() =>
              onSendMessage(
                "Explain like I'm five with a simple story based on this chapter"
              )
            }
            className="px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Explain like I&apos;m five
          </button>
          <button
            onClick={() =>
              onSendMessage("Give me 3 practice questions on this chapter")
            }
            className="px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Practice questions
          </button>
        </div>
      </div>

      {/* Context Reference */}
      {contextReference && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
            <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-xs text-amber-700 truncate flex-1">
              {contextReference}
            </span>
            <button
              onClick={onClearReference}
              className="shrink-0 text-amber-500 hover:text-amber-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card focus-within:ring-2 focus-within:ring-[#7c3aed]/20 focus-within:border-[#7c3aed] transition-colors">
          <input
            type="text"
            placeholder="Ask anything about this chapter"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
