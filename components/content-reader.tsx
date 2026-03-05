// "use client"

// import { useState, useRef, useEffect, useCallback } from "react"
// import {
//   Sparkles,
//   MessageSquare,
//   Highlighter,
//   Copy,
//   ChevronDown,
//   BookOpen,
//   Eye,
//   EyeOff,
//   Search,
// } from "lucide-react"

// interface TextToolbarProps {
//   position: { top: number; left: number }
//   selectedText: string
//   onAskAI: (text: string) => void
//   onAddSnippet: () => void
//   onAddComment: () => void
//   onHighlight: () => void
//   onCopy: () => void
//   onClose: () => void
// }

// function TextToolbar({
//   position,
//   selectedText,
//   onAskAI,
//   onAddSnippet,
//   onAddComment,
//   onHighlight,
//   onCopy,
//   onClose,
// }: TextToolbarProps) {
//   return (
//     <div
//       className="fixed z-50 flex items-center gap-1 px-2 py-1.5 rounded-lg bg-card border border-border shadow-lg"
//       style={{ top: position.top, left: position.left }}
//     >
//       <button
//         onClick={onAddSnippet}
//         className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
//       >
//         <ChevronDown className="w-3 h-3" />
//         Add it to
//       </button>
//       <div className="w-px h-4 bg-border" />
//       <button
//         onClick={() => onAskAI(selectedText)}
//         className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
//       >
//         <Sparkles className="w-3 h-3" />
//         Ask AI
//       </button>
//       <div className="w-px h-4 bg-border" />
//       <button
//         onClick={onAddComment}
//         className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
//       >
//         <MessageSquare className="w-3 h-3" />
//         Add a Comment
//       </button>
//       <div className="w-px h-4 bg-border" />
//       <button
//         onClick={onHighlight}
//         className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
//       >
//         <Highlighter className="w-3 h-3" />
//         Highlight
//       </button>
//       <div className="w-px h-4 bg-border" />
//       <button
//         onClick={onCopy}
//         className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
//       >
//         <Copy className="w-3 h-3" />
//         Copy Text
//       </button>
//     </div>
//   )
// }

// type ChapterStatus = "completed" | "in-progress" | "not-started"

// interface Chapter {
//   id: string
//   title: string
//   status: ChapterStatus
//   badge?: string
//   subtitle?: string
//   sections: {
//     id: string
//     label?: string
//     title: string
//     body: string
//     image?: string
//   }[]
//   vocabulary: { word: string; definition: string }[]
// }


// interface ContentReaderProps {
//   onAskAI: (text: string) => void
//   onChapterContextChange: (context: string) => void
//   onChapterChange?: (chapterId: string) => void
// }

// export function ContentReader({
//   onAskAI,
//   onChapterContextChange,
//   onChapterChange,
// }: ContentReaderProps) {
//   const [isRevealed, setIsRevealed] = useState(false)
//   const [showToolbar, setShowToolbar] = useState(false)
//   const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 })
//   const [selectedText, setSelectedText] = useState("")
//   const [highlights, setHighlights] = useState<string[]>([
//     "When Harsha ascended to the throne at just sixteen years old in 606 CE,",
//   ])
//   const [savedSnippets, setSavedSnippets] = useState<string[]>([])
//   const [comments, setComments] = useState<{ id: string; text: string; note: string }[]>([])
  
//   const [searchTerm, setSearchTerm] = useState("")
//   const contentRef = useRef<HTMLDivElement>(null)

//   const handleMouseUp = useCallback(() => {
//     const selection = window.getSelection()
//     if (selection && selection.toString().trim().length > 0) {
//       const range = selection.getRangeAt(0)
//       const rect = range.getBoundingClientRect()
//       setSelectedText(selection.toString().trim())
//       setToolbarPos({
//         top: rect.top - 50,
//         left: Math.max(rect.left, 10),
//       })
//       setShowToolbar(true)
//     } else {
//       setShowToolbar(false)
//     }
//   }, [])

//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (showToolbar) {
//         const target = e.target as HTMLElement
//         if (!target.closest("[data-toolbar]")) {
//           setShowToolbar(false)
//         }
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside)
//     return () => document.removeEventListener("mousedown", handleClickOutside)
//   }, [showToolbar])

//   const handleHighlight = () => {
//     if (selectedText && !highlights.includes(selectedText)) {
//       setHighlights([...highlights, selectedText])
//     }
//     setShowToolbar(false)
//     window.getSelection()?.removeAllRanges()
//   }

//   const renderHighlightedText = (text: string) => {
//     let result = text
//     highlights.forEach((hl) => {
//       if (result.includes(hl)) {
//         result = result.replace(
//           hl,
//           `<mark class="bg-amber-200/70 text-foreground px-0.5 rounded-sm cursor-pointer">${hl}</mark>`
//         )
//       }
//     })
//     return result
//   }

 

 


//   return (
//     <div className="flex flex-1 h-full overflow-hidden" ref={contentRef}>
//       {/* Left Chapters Panel */}
//       <aside className="w-80 border-r border-border bg-card flex flex-col shrink-0">
//         <div className="px-4 py-3 border-b border-border">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
//               Chapters
//             </span>
//           </div>
//           <div className="relative">
//             <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
//             <input
//               type="text"
//               placeholder="Search within this chapter"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-8 pr-2 py-1.5 rounded-md border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-[#7c3aed]/40 focus:border-[#7c3aed]"
//             />
//           </div>
//         </div>
//         <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
//           {filteredChapters.map((chapter) => {
//             const isActive = chapter.id === selectedChapterId
//             let statusLabel = "Not Started"
//             let statusClasses =
//               "text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"

//             if (chapter.status === "completed") {
//               statusLabel = "Completed"
//               statusClasses =
//                 "text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
//             } else if (chapter.status === "in-progress") {
//               statusLabel = "In Progress"
//               statusClasses =
//                 "text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-200"
//             }

//             return (
//               <button
//                 key={chapter.id}
//                 onClick={() => setSelectedChapterId(chapter.id)}
//                 className={`w-full flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
//                   isActive
//                     ? "border-[#7c3aed] bg-[#7c3aed]/5"
//                     : "border-border bg-background hover:bg-muted"
//                 }`}
//               >
//                 <div className="flex items-center gap-3 min-w-0">
//                   <div
//                     className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold ${
//                       chapter.status === "completed"
//                         ? "bg-emerald-500 text-white"
//                         : chapter.status === "in-progress"
//                         ? "bg-[#7c3aed] text-white"
//                         : "bg-muted text-muted-foreground"
//                     }`}
//                   >
//                     {chapter.badge ?? "CH"}
//                   </div>
//                   <div className="flex flex-col min-w-0">
//                     <span className="text-sm font-medium text-foreground truncate">
//                       {chapter.title}
//                     </span>
//                     {chapter.subtitle && (
//                       <span className="text-[11px] text-muted-foreground truncate">
//                         {chapter.subtitle}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//                 <span className={statusClasses}>{statusLabel}</span>
//               </button>
//             )
//           })}
//         </div>
//       </aside>

//       {/* Reader Content */}
//       <div className="flex-1 overflow-y-auto">
//         <div className="max-w-2xl mx-auto py-6 px-4">
//           {/* Current chapter pill */}
//           <button className="flex items-center gap-2 px-4 py-2 mb-6 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors">
//             <BookOpen className="w-4 h-4" />
//             <span className="truncate">
//               {selectedChapter ? selectedChapter.title : "Select a chapter"}
//             </span>
//           </button>

//           {/* Click to Reveal Card */}
//           <div
//             className={`mb-6 rounded-xl border-2 transition-all duration-300 ${
//               isRevealed
//                 ? "border-[#7c3aed]/30 bg-[#7c3aed]/5"
//                 : "border-amber-300 bg-amber-50"
//             }`}
//           >
//             <button
//               onClick={() => setIsRevealed(!isRevealed)}
//               className="w-full p-5 text-left"
//             >
//               <div className="flex items-center gap-2 mb-2">
//                 <span
//                   className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
//                     isRevealed
//                       ? "bg-[#7c3aed] text-white"
//                       : "bg-amber-400 text-amber-900"
//                   }`}
//                 >
//                   {isRevealed ? (
//                     <EyeOff className="w-3 h-3" />
//                   ) : (
//                     <Eye className="w-3 h-3" />
//                   )}
//                   {isRevealed ? "Click to Hide" : "Click to Reveal"}
//                 </span>
//               </div>
//               <h3 className="text-base font-semibold text-foreground mb-1">
//                 Character Introduction
//               </h3>
//               <p className="text-sm text-muted-foreground">
//                 {isRevealed
//                   ? "Harsha (c. 590-647 CE) was a powerful emperor who ruled over a vast territory in northern India. Known for his military prowess, diplomatic skill, and patronage of arts and learning, he united much of North India under his rule. Sasanka was the king of Gauda (Bengal) who was involved in the deaths of Harsha's elder brother and brother-in-law."
//                   : "Click to reveal the Main characters of the story."}
//               </p>
//             </button>
//           </div>

//           {/* Chapter Parts */}
//           {selectedChapter.sections.map((section, index) => (
//             <div
//               key={section.id}
//               className="mb-6 rounded-xl border border-border bg-card overflow-hidden"
//             >
//               <div className="p-4 pb-0">
//                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#7c3aed] text-white mb-3">
//                   <span className="w-1.5 h-1.5 rounded-full bg-white" />
//                   {section.title}
//                 </span>
//               </div>

//               {/* Optional image for the first part or when provided */}
//               {section.image && (
//                 <div className="px-4 pb-4">
//                   <div className="rounded-lg overflow-hidden">
//                     <img
//                       src={section.image}
//                       alt={section.title}
//                       className="w-full h-56 object-cover"
//                     />
//                   </div>
//                 </div>
//               )}

//               {/* Content */}
//               <div className="px-4 pb-6" onMouseUp={handleMouseUp}>
//                 <h2 className="text-xl font-bold text-foreground mb-3">
//                   {section.title}
//                 </h2>
//                 <div
//                   className="text-sm leading-relaxed text-foreground/80"
//                   dangerouslySetInnerHTML={{
//                     __html: renderHighlightedText(section.body),
//                   }}
//                 />
//               </div>
//             </div>
//           ))}

//           {/* Vocabulary Section */}
//           <div className="rounded-xl border border-border bg-card p-5">
//             <h3 className="text-base font-semibold text-foreground mb-4">
//               Vocabulary
//             </h3>
//             <div className="flex flex-col gap-3">
//               {vocabularyWords.map((item) => (
//                 <div
//                   key={item.word}
//                   className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
//                 >
//                   <span className="text-sm font-semibold text-[#7c3aed] shrink-0 min-w-[100px]">
//                     {item.word}
//                   </span>
//                   <span className="text-sm text-muted-foreground">
//                     {item.definition}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Saved snippets */}
//           {savedSnippets.length > 0 && (
//             <div className="mt-6 rounded-xl border border-border bg-card p-5">
//               <h3 className="text-base font-semibold text-foreground mb-3">
//                 Saved snippets
//               </h3>
//               <div className="flex flex-col gap-2">
//                 {savedSnippets.map((snippet, index) => (
//                   <div
//                     key={`${index}-${snippet.slice(0, 20)}`}
//                     className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground"
//                   >
//                     {snippet}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Comments */}
//           {comments.length > 0 && (
//             <div className="mt-6 rounded-xl border border-border bg-card p-5">
//               <h3 className="text-base font-semibold text-foreground mb-3">
//                 Comments
//               </h3>
//               <div className="flex flex-col gap-3">
//                 {comments.map((comment) => (
//                   <div
//                     key={comment.id}
//                     className="rounded-lg border border-border bg-muted/40 p-3"
//                   >
//                     <p className="text-xs text-muted-foreground mb-1">
//                       <span className="font-semibold">Text:</span> {comment.text}
//                     </p>
//                     <p className="text-xs text-foreground">
//                       <span className="font-semibold">Comment:</span>{" "}
//                       {comment.note}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Text Selection Toolbar */}
//         {showToolbar && (
//           <div data-toolbar>
//             <TextToolbar
//               position={toolbarPos}
//               selectedText={selectedText}
//               onAskAI={(text) => {
//                 onAskAI(text)
//                 setShowToolbar(false)
//               }}
//               onAddSnippet={handleAddSnippet}
//               onAddComment={handleAddComment}
//               onHighlight={handleHighlight}
//               onCopy={handleCopy}
//               onClose={() => setShowToolbar(false)}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
