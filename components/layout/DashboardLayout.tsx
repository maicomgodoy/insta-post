'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface DashboardLayoutProps {
  children: ReactNode
  locale: string
}

export function DashboardLayout({ children, locale }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar locale={locale} />
      
      {/* Main content area - with left margin for sidebar */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
