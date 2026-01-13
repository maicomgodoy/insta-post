'use client'

import { ReactNode } from 'react'
import { Button } from './Button'

interface EmptyProps {
  icon?: ReactNode
  title?: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function Empty({
  icon,
  title = 'No data',
  message = 'There is no data to display.',
  action,
  className = '',
}: EmptyProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-6 ${className}`}>
      {/* Default icon or custom icon */}
      {icon || (
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
        {message}
      </p>
      
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
