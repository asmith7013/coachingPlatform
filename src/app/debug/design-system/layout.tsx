import { cn } from '@ui/utils/formatters';
import Link from 'next/link'

const navItems = [
  { href: '/tools/design-system/tokens', label: 'Tokens' },
  { href: '/tools/design-system/text', label: 'Typography' },
  { href: '/tools/design-system/spacing', label: 'Spacing' },
  { href: '/tools/design-system/buttons', label: 'Buttons' },
  { href: '/tools/design-system/cards', label: 'Cards' },
]

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-8 px-4">
          <span className="font-semibold text-primary">Design System</span>
          <div className="flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium text-muted transition-colors',
                  'hover:text-primary'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-7xl p-8">
        {children}
      </main>
    </div>
  )
} 