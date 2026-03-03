"use client"

import { useState } from "react"
import { Plus, MoreVertical } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
}

export function NotesPanel() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "My Note",
      content:
        "Harsha's expedition against Sasanka was a significant event in Indian history. It marked Harsha's ambition to expand his empire and avenge the death of his brother.",
      createdAt: "2 min ago",
    },
    {
      id: "2",
      title: "Key Characters",
      content:
        "Harsha - Young king who ascended at 16. Sasanka - King of Gauda (Bengal). Rajyavardhana - Harsha's elder brother who was killed.",
      createdAt: "5 min ago",
    },
  ])
  const [editingId, setEditingId] = useState<string | null>(null)

  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
      createdAt: "Just now",
    }
    setNotes([newNote, ...notes])
    setEditingId(newNote.id)
  }

  const updateNote = (id: string, field: keyof Note, value: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, [field]: value } : n)))
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-medium text-foreground">Notes</span>
        <button
          onClick={addNote}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-[#7c3aed] hover:bg-[#7c3aed]/10 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Note
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="rounded-xl border border-[#7c3aed]/20 bg-[#7c3aed]/5 p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-[#7c3aed] flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 1H8C8.5523 1 9 1.4477 9 2V8C9 8.5523 8.5523 9 8 9H2C1.4477 9 1 8.5523 1 8V2C1 1.4477 1.4477 1 2 1Z" stroke="white" strokeWidth="1.2"/>
                    <line x1="3" y1="3.5" x2="7" y2="3.5" stroke="white" strokeWidth="0.8"/>
                    <line x1="3" y1="5.5" x2="7" y2="5.5" stroke="white" strokeWidth="0.8"/>
                    <line x1="3" y1="7.5" x2="5.5" y2="7.5" stroke="white" strokeWidth="0.8"/>
                  </svg>
                </div>
                {editingId === note.id ? (
                  <input
                    type="text"
                    value={note.title}
                    onChange={(e) => updateNote(note.id, "title", e.target.value)}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                    autoFocus
                    className="text-sm font-semibold text-foreground bg-transparent outline-none border-b border-[#7c3aed]"
                  />
                ) : (
                  <span
                    className="text-sm font-semibold text-foreground cursor-pointer"
                    onClick={() => setEditingId(note.id)}
                  >
                    {note.title}
                  </span>
                )}
              </div>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            {editingId === note.id ? (
              <textarea
                value={note.content}
                onChange={(e) => updateNote(note.id, "content", e.target.value)}
                rows={4}
                className="w-full text-xs text-muted-foreground leading-relaxed bg-transparent outline-none resize-none"
                placeholder="Start typing your note..."
              />
            ) : (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                {note.content}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
