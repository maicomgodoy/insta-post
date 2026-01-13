'use client'

import { Button } from './Button'

interface ErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryText?: string
  className?: string
}

export function Error({
  title = 'Something went wrong',
  message = 'An error occurred. Please try again.',
  onRetry,
  retryText = 'Try again',
  className = '',
}: ErrorProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-6 ${className}`}>
      {/* Error icon */}
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
        <svg
          className="w-6 h-6 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
        {message}
      </p>
      
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryText}
        </Button>
      )}
    </div>
  )
}

/**
 * ErrorPage - Full page error state
 */
export function ErrorPage({
  title,
  message,
  onRetry,
  retryText,
}: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Error title={title} message={message} onRetry={onRetry} retryText={retryText} />
    </div>
  )
}
