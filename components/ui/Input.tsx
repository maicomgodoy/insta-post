'use client'

import { InputHTMLAttributes, forwardRef, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const hasError = !!error

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-body-sm font-medium text-gray-900 dark:text-gray-50 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full
              h-10
              px-4
              ${icon ? 'pl-10' : ''}
              bg-white dark:bg-[#141414]
              border rounded-md
              text-body text-gray-900 dark:text-gray-50
              placeholder-gray-400 dark:placeholder-gray-500
              transition-all duration-fast
              focus:outline-none focus:ring-2 focus:ring-offset-0
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
        </div>
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

Input.displayName = 'Input'
