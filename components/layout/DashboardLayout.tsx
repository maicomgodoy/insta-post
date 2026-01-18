'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface DashboardLayoutProps {
  children: ReactNode
  locale: string
}

export function DashboardLayout({ children, locale }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A]">
      {/* Sidebar */}
      <Sidebar locale={locale} />
      
      {/* Main content area - with left margin for sidebar */}
      <main className="ml-60 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
