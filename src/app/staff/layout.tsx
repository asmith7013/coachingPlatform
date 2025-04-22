import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Staff Management',
  description: 'Manage staff members and view their schedules',
}

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      {children}
    </div>
  )
} 