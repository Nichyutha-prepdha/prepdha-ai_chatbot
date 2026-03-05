"use client"

import { useState, useCallback } from "react"
// import { Header } from "@/components/header"
// import { SubHeader } from "@/components/sub-header"
// import { ContentReader } from "@/components/content-reader"
import { RightPanel } from "@/components/right-panel"
import DatabaseTest from "@/components/DatabaseTest"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"

export default function PrepdhaPage() {
  const [progress, setProgress] = useState(35)
  const [contextReference, setContextReference] = useState<string | null>(null)
  const [chapterContext, setChapterContext] = useState<string | null>(null)
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null)

  const handleMarkComplete = useCallback(() => {
    setProgress(100)
  }, [])

  const handleAskAI = useCallback((text: string) => {
    setContextReference(text)
  }, [])

  const handleClearReference = useCallback(() => {
    setContextReference(null)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top Header */}
      {/* <Header /> */}

      {/* Sub Header */}
      {/* <SubHeader 
        progress={progress} 
        onMarkComplete={handleMarkComplete}
      /> */}

      {/* Main Content Area - resizable */}
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 min-h-0"
      >
        <ResizablePanel defaultSize={70} minSize={40} order={1}>
          <DatabaseTest />
        </ResizablePanel>
        <ResizableHandle withHandle className="bg-border cursor-col-resize hover:bg-[#7c3aed]/20 transition-colors" />
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50} order={2}>
          <RightPanel
            contextReference={contextReference}
            onClearReference={handleClearReference}
            chapterContext={chapterContext}
            currentChapterId={currentChapterId}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
