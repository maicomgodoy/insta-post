'use client'

import { TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, rows = 4, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const hasError = !!error

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-body-sm font-medium text-gray-900 dark:text-gray-50 mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`
            w-full
            min-h-[100px]
            px-4 py-3
            bg-white dark:bg-[#141414]
            border rounded-md
            text-body text-gray-900 dark:text-gray-50
            placeholder-gray-400 dark:placeholder-gray-500
            transition-all duration-fast
            focus:outline-none focus:ring-2 focus:ring-offset-0
            resize-y
            ${
              hasError
                ? 'border-error-500 focus:ring-error-500 focus:border-error-500'
                : 'border-gray-200 dark:border-gray-800 focus:ring-primary-500 focus:border-primary-500'
            }
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-[#1F1F1F]
            ${className}
          `}
          {...props}
        />
        {helperText && !error && (
          <p className="mt-1.5 text-caption text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
        {error && (
          <p className="mt-1.5 text-caption text-error-500">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
