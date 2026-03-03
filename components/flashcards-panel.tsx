"use client"

import { useState } from "react"
import { MoreVertical, Plus, Tag } from "lucide-react"

interface Flashcard {
  id: string
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  topic: string
  count: number
}

export function FlashcardsPanel() {
  const [cards, setCards] = useState<Flashcard[]>([
    {
      id: "1",
      title: "Sasanka vs Harsha",
      difficulty: "Easy",
      topic: "The Challenge Ahead",
      count: 12,
    },
    {
      id: "2",
      title: "Kings of Ancient India",
      difficulty: "Medium",
      topic: "Character Introduction",
      count: 8,
    },
  ])
  const [editingId, setEditingId] = useState<string | null>(null)

  const addCard = () => {
    const newCard: Flashcard = {
      id: Date.now().toString(),
      title: "New Flashcard Set",
      difficulty: "Easy",
      topic: "The Challenge Ahead",
      count: 0,
    }
    setCards([...cards, newCard])
    setEditingId(newCard.id)
  }

  const difficultyColor = (d: string) => {
    if (d === "Easy") return "text-emerald-600"
    if (d === "Medium") return "text-amber-600"
    return "text-red-600"
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-medium text-foreground">Flashcards</span>
        <button
          onClick={addCard}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-[#7c3aed] hover:bg-[#7c3aed]/10 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Set
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className="rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="3" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground" />
                    <rect x="4" y="1" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {card.title}
                </span>
              </div>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-medium ${difficultyColor(card.difficulty)}`}>
                {card.difficulty}
              </span>
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {card.topic}
                </span>
                <span className="text-xs text-[#7c3aed] font-medium ml-1">+1</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {card.count} cards
            </span>
            {editingId === card.id && (
              <button
                onClick={() => setEditingId(null)}
                className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.5 1.5L10.5 3.5M1 11L1.5 8.5L9.5 0.5L11.5 2.5L3.5 10.5L1 11Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Edit Properties
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
