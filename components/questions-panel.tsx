"use client"

import { useState } from "react"
import { Plus, MoreVertical } from "lucide-react"

interface QuestionCard {
  id: string
  title: string
  question: string
  hint: string
  answer: string
}

export function QuestionsPanel() {
  const [questions, setQuestions] = useState<QuestionCard[]>([
    {
      id: "1",
      title: "Card 1",
      question: "What event triggered Harsha's military expedition?",
      hint: "Think about what happened to his family members",
      answer: "The death of his brother Rajyavardhana at the hands of Sasanka",
    },
    {
      id: "2",
      title: "Card 2",
      question: "How old was Harsha when he ascended the throne?",
      hint: "He was very young for a king",
      answer: "Sixteen years old, in 606 CE",
    },
  ])
  const [editingId, setEditingId] = useState<string | null>(null)

  const addQuestion = () => {
    const newQ: QuestionCard = {
      id: Date.now().toString(),
      title: `Card ${questions.length + 1}`,
      question: "",
      hint: "",
      answer: "",
    }
    setQuestions([...questions, newQ])
    setEditingId(newQ.id)
  }

  const updateQuestion = (id: string, field: keyof QuestionCard, value: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-medium text-foreground">Questions</span>
        <button
          onClick={addQuestion}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-[#7c3aed] hover:bg-[#7c3aed]/10 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Card
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {questions.map((q) => (
          <div
            key={q.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-[#7c3aed] flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="3" height="3" rx="0.5" fill="white"/>
                    <rect x="6" y="1" width="3" height="3" rx="0.5" fill="white"/>
                    <rect x="1" y="6" width="3" height="3" rx="0.5" fill="white"/>
                    <rect x="6" y="6" width="3" height="3" rx="0.5" fill="white"/>
                  </svg>
                </div>
                <span className="text-sm font-semibold text-foreground">{q.title}</span>
              </div>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Question
                </label>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(q.id, "question", e.target.value)}
                  placeholder="Enter your question here"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Hint
                </label>
                <input
                  type="text"
                  value={q.hint}
                  onChange={(e) => updateQuestion(q.id, "hint", e.target.value)}
                  placeholder="Enter Hint Here"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Answer
                </label>
                <input
                  type="text"
                  value={q.answer}
                  onChange={(e) => updateQuestion(q.id, "answer", e.target.value)}
                  placeholder="Enter answer here"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-amber-50 border-amber-200 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-300/30 focus:border-amber-300 transition-colors"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
