'use client'

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from '@headlessui/react'
import { cn } from '@ui/utils/formatters'
import { tv } from 'tailwind-variants'
// import { textColors, textSize, paddingX, paddingY, radii } from '@ui-tokens/tokens'
import Image from 'next/image'
import Link from 'next/link'

// Define the navigation item type
export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  current?: boolean
  children?: NavigationItem[] // Add nested navigation support
  requiredRoles?: string[] // Add role-based access
  requiredPermissions?: string[] // Add permission-based access
}

// Define the team type
export interface TeamItem {
  id: string | number
  name: string
  href: string
  initial: string
  current?: boolean
}

// Define the sidebar props
interface NavigationSidebarProps {
  navigation: NavigationItem[]
  teams?: TeamItem[]
  logo?: {
    src: string
    alt: string
  }
  showTeams?: boolean
  className?: string
  sidebarOpen: boolean  // ✅ Make these controlled from parent
  setSidebarOpen: (open: boolean) => void  // ✅ Controlled from parent
}

// Create the sidebar styles using tv from tailwind-variants
const sidebar = tv({
  slots: {
    // Mobile sidebar dialog
    mobileBackdrop: 'fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0',
    mobileContainer: 'fixed inset-0 flex',
    mobilePanel: 'relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full',
    mobileCloseButton: 'absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0',
    mobileCloseIcon: 'size-6 text-white',
    
    // Desktop sidebar
    desktopSidebar: 'hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col',
    
    // Shared sidebar content
    sidebarContent: 'flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4',
    sidebarLogo: 'flex h-16 shrink-0 items-center',
    logoImage: 'h-8 w-8 object-contain',
    
    // Navigation
    nav: 'flex flex-1 flex-col',
    navList: 'flex flex-1 flex-col gap-y-7',
    navGroup: '-mx-2 space-y-1',
    navItem: 'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
    navItemCurrent: 'bg-gray-50 text-indigo-600',
    navItemDefault: 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
    navIcon: 'size-6 shrink-0',
    navIconCurrent: 'text-indigo-600',
    navIconDefault: 'text-gray-400 group-hover:text-indigo-600',
    
    // Teams section
    teamsLabel: 'text-xs/6 font-semibold text-gray-400',
    teamsList: '-mx-2 mt-2 space-y-1',
    teamItem: 'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
    teamItemCurrent: 'bg-gray-50 text-indigo-600',
    teamItemDefault: 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
    teamBadge: 'flex size-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.625rem] font-medium',
    teamBadgeCurrent: 'border-indigo-600 text-indigo-600',
    teamBadgeDefault: 'border-gray-200 text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600',
    
    // Settings at bottom
    settingsItem: 'group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
    settingsIcon: 'size-6 shrink-0 text-gray-400 group-hover:text-indigo-600',
  }
});

export function NavigationSidebar({
  navigation,
  teams = [],
  logo = {
    src: '/logo2.png',
    alt: 'Your Company'
  },
  showTeams = true,
  className,
  sidebarOpen,
  setSidebarOpen
}: NavigationSidebarProps) {
  const styles = sidebar();

  // Function to render navigation items
  const renderNavItems = (items: NavigationItem[], depth = 0) => (
    <ul role="list" className={cn(styles.navGroup(), depth > 0 && "ml-6")}>
      {items.map((item) => (
        <li key={item.name}>
          {!item.children ? (
            // Regular navigation item
            <Link
              href={item.href}
              className={cn(
                item.current ? styles.navItemCurrent() : styles.navItemDefault(),
                styles.navItem()
              )}
            >
              <item.icon
                aria-hidden="true"
                className={cn(
                  item.current ? styles.navIconCurrent() : styles.navIconDefault(),
                  styles.navIcon()
                )}
              />
              {item.name}
            </Link>
          ) : (
            // Parent item with children
            <>
              <div
                className={cn(
                  item.current ? styles.navItemCurrent() : styles.navItemDefault(),
                  styles.navItem(),
                  "cursor-default"
                )}
              >
                <item.icon
                  aria-hidden="true"
                  className={cn(
                    item.current ? styles.navIconCurrent() : styles.navIconDefault(),
                    styles.navIcon()
                  )}
                />
                {item.name}
              </div>
              {renderNavItems(item.children, depth + 1)}
            </>
          )}
        </li>
      ))}
    </ul>
  );

  // Function to render teams section
  const renderTeams = () => (
    <>
      <div className={styles.teamsLabel()}>Your teams</div>
      <ul role="list" className={styles.teamsList()}>
        {teams.map((team) => (
          <li key={team.name}>
            <Link
              href={team.href}
              className={cn(
                team.current ? styles.teamItemCurrent() : styles.teamItemDefault(),
                styles.teamItem()
              )}
            >
              <span
                className={cn(
                  team.current ? styles.teamBadgeCurrent() : styles.teamBadgeDefault(),
                  styles.teamBadge()
                )}
              >
                {team.initial}
              </span>
              <span className="truncate">{team.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );

  // Function to render sidebar content (used in both mobile and desktop)
  const renderSidebarContent = () => (
    <div className={styles.sidebarContent()}>
      <div className={styles.sidebarLogo()}>
        <Image
          alt={logo.alt}
          src={logo.src}
          className={styles.logoImage()}
          width={32}
          height={32}
          unoptimized // ✅ Add this for external SVGs
        />
      </div>
      <nav className={styles.nav()}>
        <ul role="list" className={styles.navList()}>
          <li>
            {renderNavItems(navigation)}
          </li>
          {showTeams && teams.length > 0 && (
            <li>
              {renderTeams()}
            </li>
          )}
          <li className="mt-auto">
            <Link
              href="/settings"
              className={styles.settingsItem()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden="true"
                className={styles.settingsIcon()}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Settings
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );

  // Render mobile dialog for sidebar
  const renderMobileDialog = () => (
    <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
      <DialogBackdrop
        transition
        className={styles.mobileBackdrop()}
      />

      <div className={styles.mobileContainer()}>
        <DialogPanel
          transition
          className={styles.mobilePanel()}
        >
          <TransitionChild>
            <div className={styles.mobileCloseButton()}>
              <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                <span className="sr-only">Close sidebar</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={styles.mobileCloseIcon()}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </TransitionChild>
          {renderSidebarContent()}
        </DialogPanel>
      </div>
    </Dialog>
  );

  return (
    <>
      {/* Mobile sidebar dialog */}
      {renderMobileDialog()}

      {/* Static sidebar for desktop */}
      <div className={cn(styles.desktopSidebar(), className)}>
        {renderSidebarContent()}
      </div>
    </>
  );
}