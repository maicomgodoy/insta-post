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
    bg-primary-500 text-white
    hover:bg-primary-600
    active:bg-primary-700
    focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    dark:focus:ring-offset-[#0A0A0A]
  `,
  secondary: `
    bg-gray-100 text-gray-900
    hover:bg-gray-200
    active:bg-gray-300
    dark:bg-[#1F1F1F] dark:text-gray-50
    dark:hover:bg-[#262626]
    dark:active:bg-[#2A2A2A]
    focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
    dark:focus:ring-offset-[#0A0A0A]
  `,
  outline: `
    bg-transparent text-gray-700 border border-gray-300
    hover:bg-gray-50 hover:border-gray-400
    active:bg-gray-100
    dark:text-gray-200 dark:border-gray-700
    dark:hover:bg-[#1F1F1F] dark:hover:border-gray-600
    dark:active:bg-[#262626]
    focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    dark:focus:ring-offset-[#0A0A0A]
  `,
  ghost: `
    bg-transparent text-gray-700
    hover:bg-gray-100
    active:bg-gray-200
    dark:text-gray-200
    dark:hover:bg-[#1F1F1F]
    dark:active:bg-[#262626]
    focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
    dark:focus:ring-offset-[#0A0A0A]
  `,
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-body-sm',
  md: 'h-10 px-4 text-body',
  lg: 'h-12 px-6 text-body',
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
          rounded-md
          transition-all duration-fast
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
