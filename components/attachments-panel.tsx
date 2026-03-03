"use client"

import { useState, useRef } from "react"
import { Upload, FileText, X, Eye, MoreVertical, Download, Image as ImageIcon, HelpCircle, Key } from "lucide-react"

interface Attachment {
  id: string
  name: string
  type: "txt" | "image" | "other"
  size: string
  sizeInBytes: number
  file?: File
  thumbnails: number
}

export function AttachmentsPanel() {
  const [attachments, setAttachments] = useState<Attachment[]>([
    {
      id: "1",
      name: "Chapter_Notes.txt",
      type: "txt",
      size: "240 Kb",
      sizeInBytes: 245760,
      thumbnails: 3,
    },
    {
      id: "2",
      name: "Historical_Maps.txt",
      type: "txt",
      size: "540 Kb",
      sizeInBytes: 552960,
      thumbnails: 5,
    },
    {
      id: "3",
      name: "Study_Guide.txt",
      type: "txt",
      size: "180 Kb",
      sizeInBytes: 184320,
      thumbnails: 2,
    },
    {
      id: "4",
      name: "Timeline_Chart.txt",
      type: "txt",
      size: "320 Kb",
      sizeInBytes: 327680,
      thumbnails: 4,
    },
  ])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    
    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random().toString(),
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : file.name.endsWith('.txt') ? 'txt' : 'other',
      size: `${(file.size / 1024).toFixed(0)} Kb`,
      sizeInBytes: file.size,
      file,
      thumbnails: file.type.startsWith('image/') ? 3 : 1,
    }))
    
    setAttachments(prev => [...prev, ...newAttachments])
  }

  const downloadKeyPoints = (attachment: Attachment) => {
    // Mock download function
    console.log('Downloading key points for:', attachment.name)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Attachments</h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
        >
          <Upload className="w-4 h-4" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files)}
      />

      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card"
          >
            <div className="flex-shrink-0">
              {attachment.type === 'image' ? (
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              ) : (
                <FileText className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {attachment.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {attachment.size} • {attachment.thumbnails} thumbnails
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => downloadKeyPoints(attachment)}
                className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                title="Generate Key Points"
              >
                <Key className="w-3 h-3" />
              </button>
              <button className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors">
                <MoreVertical className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
