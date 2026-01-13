'use client'

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: ReactNode
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-primary text-white
    hover:bg-blue-700
    focus:ring-2 focus:ring-primary focus:ring-offset-2
    dark:focus:ring-offset-gray-900
  `,
  secondary: `
    bg-gray-100 text-gray-900
    hover:bg-gray-200
    dark:bg-gray-700 dark:text-gray-100
    dark:hover:bg-gray-600
    focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
    dark:focus:ring-offset-gray-900
  `,
  outline: `
    bg-transparent text-gray-700 border border-gray-300
    hover:bg-gray-50
    dark:text-gray-200 dark:border-gray-600
    dark:hover:bg-gray-800
    focus:ring-2 focus:ring-primary focus:ring-offset-2
    dark:focus:ring-offset-gray-900
  `,
  ghost: `
    bg-transparent text-gray-700
    hover:bg-gray-100
    dark:text-gray-200
    dark:hover:bg-gray-800
    focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
    dark:focus:ring-offset-gray-900
  `,
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      className = '',
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center
          font-medium
          rounded-lg
          transition-all duration-200
          focus:outline-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
