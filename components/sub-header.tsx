"use client"

import { ChevronLeft, Star, Zap } from "lucide-react"
import { useState } from "react"

interface SubHeaderProps {
  progress: number
  onMarkComplete: () => void
}

export function SubHeader({ progress, onMarkComplete }: SubHeaderProps) {
  const [isStarred, setIsStarred] = useState(false)

  return (
    <div className="flex flex-col gap-2 px-6 py-3 bg-card border-b border-border">
      {/* Breadcrumb row */}
      <div className="flex items-center gap-2">
        <button
          className="flex items-center justify-center w-9 h-9 rounded-full border border-border hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex flex-col gap-0.5 flex-1">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">History</span>
            <span>{">"}</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Social Studies</span>
            <span>{">"}</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Military Campaigns and Expansion</span>
          </nav>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground text-balance">
              First Expedition Against Sasanka
            </h1>
            <button
              onClick={() => setIsStarred(!isStarred)}
              aria-label={isStarred ? "Remove star" : "Add star"}
            >
              <Star
                className={`w-4 h-4 transition-colors ${
                  isStarred
                    ? "text-amber-400 fill-amber-400"
                    : "text-muted-foreground hover:text-amber-400"
                }`}
              />
            </button>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
              Needs Attention
            </span>
          </div>
        </div>

        {/* Progress and actions */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-muted-foreground">Progress</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-medium text-[#7c3aed]">{progress}%</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/20">
            <Zap className="w-3.5 h-3.5 text-[#7c3aed] fill-[#7c3aed]" />
            <span className="text-xs font-semibold text-[#7c3aed]">54 XP</span>
          </div>
          <button
            onClick={onMarkComplete}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-[#7c3aed] text-[#7c3aed] text-sm font-medium hover:bg-[#7c3aed] hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Mark Complete
          </button>
        </div>
      </div>
    </div>
  )
}
