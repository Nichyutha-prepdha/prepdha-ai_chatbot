"use client"

import { useState, useRef, useEffect } from "react"
import { 
  Pencil, 
  Save, 
  X, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Highlighter,
  Type,
  Palette,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight
} from "lucide-react"

interface EditPanelProps {
  contextReference: string | null
  chapterContext: string | null
  currentChapterId: string | null
}

interface EditContent {
  id: string
  title: string
  content: string
  lastModified: string
  chapterId: string | null
}

export function EditPanel({ 
  contextReference, 
  chapterContext, 
  currentChapterId 
}: EditPanelProps) {
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [savedContent, setSavedContent] = useState<EditContent[]>([])
  const [selectedText, setSelectedText] = useState("")
  const [showToolbar, setShowToolbar] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left")
  const editorRef = useRef<HTMLDivElement>(null)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  useEffect(() => {
    if (contextReference) {
      setContent(contextReference)
      setTitle("Selected Text Edit")
      setIsEditing(true)
    } else if (chapterContext) {
      setContent(chapterContext)
      setTitle("Chapter Content Edit")
      setIsEditing(true)
    }
  }, [contextReference, chapterContext])

  useEffect(() => {
    const saved = localStorage.getItem("editContent")
    if (saved) {
      setSavedContent(JSON.parse(saved))
    }
  }, [])

  const saveToHistory = (newContent: string) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newContent)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    if (historyIndex >= 0 && history[historyIndex] !== newContent) {
      saveToHistory(newContent)
    }
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setContent(history[historyIndex - 1])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setContent(history[historyIndex + 1])
    }
  }

  const saveContent = () => {
    const newEdit: EditContent = {
      id: Date.now().toString(),
      title: title || "Untitled Edit",
      content: content,
      lastModified: new Date().toLocaleString(),
      chapterId: currentChapterId
    }
    
    const updated = [newEdit, ...savedContent]
    setSavedContent(updated)
    localStorage.setItem("editContent", JSON.stringify(updated))
    
    setIsEditing(false)
    setContent("")
    setTitle("")
  }

  const loadEdit = (edit: EditContent) => {
    setContent(edit.content)
    setTitle(edit.title)
    setIsEditing(true)
  }

  const deleteEdit = (id: string) => {
    const updated = savedContent.filter(e => e.id !== id)
    setSavedContent(updated)
    localStorage.setItem("editContent", JSON.stringify(updated))
  }

  const formatText = (command: string) => {
    document.execCommand(command, false)
    if (editorRef.current) {
      handleContentChange(editorRef.current.innerHTML)
    }
  }

  const formatBlock = (command: string, value?: string) => {
    if (value) {
      document.execCommand(command, false, value)
    } else {
      document.execCommand(command, false)
    }
    if (editorRef.current) {
      handleContentChange(editorRef.current.innerHTML)
    }
  }

  const insertList = (ordered: boolean) => {
    const command = ordered ? 'insertOrderedList' : 'insertUnorderedList'
    document.execCommand(command, false)
    if (editorRef.current) {
      handleContentChange(editorRef.current.innerHTML)
    }
  }

  const handleTextAlign = (alignment: "left" | "center" | "right") => {
    setTextAlign(alignment)
    document.execCommand(`justify${alignment}`, false)
    if (editorRef.current) {
      handleContentChange(editorRef.current.innerHTML)
    }
  }

  const handleSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      setSelectedText(selection.toString())
      setShowToolbar(true)
    }
  }

  if (!isEditing && savedContent.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-medium text-foreground">Edit Mode</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-[#7c3aed]/10 flex items-center justify-center mx-auto mb-3">
              <Pencil className="w-5 h-5 text-[#7c3aed]" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Edit Content
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Select text in the reader to edit or create new content
            </p>
            <button
              onClick={() => {
                setIsEditing(true)
                setTitle("New Document")
                setContent("")
              }}
              className="px-4 py-2 bg-[#7c3aed] text-white text-xs rounded-lg hover:bg-[#7c3aed]/90 transition-colors"
            >
              Create New Document
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!isEditing && savedContent.length > 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-medium text-foreground">Saved Edits</span>
          <button
            onClick={() => {
              setIsEditing(true)
              setTitle("New Document")
              setContent("")
            }}
            className="text-xs px-2 py-1 bg-[#7c3aed] text-white rounded hover:bg-[#7c3aed]/90 transition-colors"
          >
            New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedContent.map((edit) => (
            <div
              key={edit.id}
              className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => loadEdit(edit)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-foreground truncate flex-1">
                  {edit.title}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteEdit(edit.id)
                  }}
                  className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {edit.content}
              </p>
              <p className="text-[10px] text-muted-foreground mt-2">
                {edit.lastModified}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document title..."
          className="text-sm font-medium text-foreground bg-transparent border-none outline-none placeholder-muted-foreground"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={saveContent}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Save"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsEditing(false)
              setContent("")
              setTitle("")
            }}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-border bg-muted/30">
        <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            onClick={() => formatText('bold')}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => formatText('italic')}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => formatText('underline')}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Underline"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            onClick={() => insertList(false)}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertList(true)}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => formatBlock('formatBlock', 'blockquote')}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Quote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => formatBlock('formatBlock', 'pre')}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Code"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            onClick={() => handleTextAlign('left')}
            className={`p-1.5 rounded transition-colors ${
              textAlign === 'left' 
                ? 'text-foreground bg-muted' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleTextAlign('center')}
            className={`p-1.5 rounded transition-colors ${
              textAlign === 'center' 
                ? 'text-foreground bg-muted' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleTextAlign('right')}
            className={`p-1.5 rounded transition-colors ${
              textAlign === 'right' 
                ? 'text-foreground bg-muted' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto p-4">
        <div
          ref={editorRef}
          contentEditable
          onInput={(e) => handleContentChange(e.currentTarget.innerHTML)}
          onSelect={handleSelection}
          className="min-h-full outline-none text-sm text-foreground leading-relaxed"
          style={{ textAlign }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Selection Toolbar */}
      {showToolbar && selectedText && (
        <div className="absolute bottom-4 left-4 right-4 bg-card border border-border rounded-lg shadow-lg p-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Selected:</span>
            <span className="text-xs text-foreground truncate flex-1">
              {selectedText}
            </span>
            <button
              onClick={() => setShowToolbar(false)}
              className="p-1 rounded text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
