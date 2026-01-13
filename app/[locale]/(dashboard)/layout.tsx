'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { RequireAuth } from '@/components/auth'
import { useParams } from 'next/navigation'

interface DashboardLayoutWrapperProps {
  children: React.ReactNode
}

export default function DashboardLayoutWrapper({
  children,
}: DashboardLayoutWrapperProps) {
  const params = useParams()
  const locale = params.locale as string

  return (
    <RequireAuth>
      <DashboardLayout locale={locale}>
        {children}
      </DashboardLayout>
    </RequireAuth>
  )
}
