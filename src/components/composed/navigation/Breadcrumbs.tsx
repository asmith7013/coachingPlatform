import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { cn } from '@ui/utils/formatters'

interface BreadcrumbItem {
  name: string
  href: string
  current: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex", className)} aria-label="Breadcrumb">
      <ol role="list" className="mx-auto flex w-full max-w-screen-xl space-x-4 px-4 sm:px-6 lg:px-8">
        <li className="flex">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-500">
              <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
        </li>
        {items.map((item) => (
          <li key={item.href} className="flex">
            <div className="flex items-center">
              <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              <Link
                href={item.href}
                className={cn(
                  'ml-4 text-sm font-medium',
                  item.current 
                    ? 'text-gray-500' 
                    : 'text-gray-500 hover:text-gray-700'
                )}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.name}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
} 