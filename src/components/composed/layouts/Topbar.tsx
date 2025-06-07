'use client'

import { cn } from '@ui/utils/formatters'
import { tv } from 'tailwind-variants'
import { Bars3Icon } from '@heroicons/react/24/outline'

interface BreadcrumbItem {
  name: string
  href: string
  current: boolean
}

interface TopbarProps {
  breadcrumbs?: BreadcrumbItem[]
  className?: string
  onMenuClick?: () => void
}

// Create topbar styles using tv from tailwind-variants
const topbarStyles = tv({
  slots: {
    container: 'w-full', // Remove sticky positioning and max-width
    header: 'flex h-12 items-center border-b border-gray-200 bg-white px-4 shadow-xs sm:px-6',
    menuButton: 'lg:hidden -m-2.5 p-2.5 text-gray-700 hover:text-gray-900',
    menuIcon: 'h-6 w-6',
    breadcrumbContainer: 'flex items-center flex-1 ml-4 lg:ml-0',
    breadcrumbNav: 'flex',
    breadcrumbList: 'flex items-center space-x-4',
    breadcrumbItem: 'flex',
    breadcrumbLink: 'text-sm font-medium text-gray-500 hover:text-gray-700',
    breadcrumbCurrent: 'text-sm font-medium text-gray-900',
    breadcrumbSeparator: 'text-gray-300',
  }
});

export function Topbar({ breadcrumbs = [], className, onMenuClick }: TopbarProps) {
  const styles = topbarStyles();
  
  return (
    <div className={cn(styles.container(), className)}>
      <div className={styles.header()}>
        {/* Mobile menu button */}
        {onMenuClick && (
          <button
            type="button"
            className={styles.menuButton()}
            onClick={onMenuClick}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className={styles.menuIcon()} aria-hidden="true" />
          </button>
        )}
        
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbContainer()}>
          <nav className={styles.breadcrumbNav()} aria-label="Breadcrumb">
            <ol className={styles.breadcrumbList()}>
              {breadcrumbs.map((item, index) => (
                <li key={item.name} className={styles.breadcrumbItem()}>
                  <div className="flex items-center">
                    {index > 0 && (
                      <svg
                        className={cn(styles.breadcrumbSeparator(), 'mr-4 h-5 w-5 flex-shrink-0')}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {item.current ? (
                      <span className={styles.breadcrumbCurrent()} aria-current="page">
                        {item.name}
                      </span>
                    ) : (
                      <a href={item.href} className={styles.breadcrumbLink()}>
                        {item.name}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </div>
  )
}