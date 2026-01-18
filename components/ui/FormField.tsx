'use client'

import { ReactNode } from 'react'

interface FormFieldProps {
  children: ReactNode
  className?: string
}

/**
 * FormField - Wrapper component for consistent form field spacing
 * Use this to wrap Input, Select, Textarea, or any form element
 */
export function FormField({ children, className = '' }: FormFieldProps) {
  return (
    <div className={`mb-6 last:mb-0 ${className}`}>
      {children}
    </div>
  )
}
