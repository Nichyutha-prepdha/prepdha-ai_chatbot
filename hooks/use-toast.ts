'use client'

import * as React from 'react'
import { toast as sonnerToast } from 'sonner'

export interface ToastProps {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

export function toast({ title, description, variant = 'default', duration = 5000 }: ToastProps) {
  const message = title && description ? `${title}: ${description}` : title || description || ''
  
  if (variant === 'destructive') {
    return sonnerToast.error(message, { duration })
  }
  
  return sonnerToast.success(message, { duration })
}

export function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss
  }
}
