'use client'

import { ReactNode } from 'react'

type CardVariant = 'default' | 'outlined'

interface CardProps {
  children: ReactNode
  variant?: CardVariant
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

const variantStyles: Record<CardVariant, string> = {
  default: `
    bg-white dark:bg-gray-800
    border border-gray-200 dark:border-gray-700
    shadow-sm
  `,
  outlined: `
    bg-transparent
    border border-gray-200 dark:border-gray-700
  `,
}

const paddingStyles: Record<'none' | 'sm' | 'md' | 'lg', string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
}: CardProps) {
  return (
    <div
      className={`
        rounded-lg
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
