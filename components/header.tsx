"use client"

import { Search, Zap, User } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-3 bg-card border-b border-border">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#7c3aed]">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9.5L7 13.5L15 4.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-lg font-semibold text-foreground tracking-tight">Prepdha</span>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for keywords, topic, chapter, anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 focus:border-[#7c3aed] transition-colors"
          />
        </div>
      </div>

      {/* Right side badges */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
          <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-700">1240 XP</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-orange-500 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          </div>
          <span className="text-xs font-semibold text-orange-600">80%</span>
        </div>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] text-xs font-bold">
          Rs
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden">
          <User className="w-4 h-4 text-card" />
        </div>
      </div>
    </header>
  )
}
