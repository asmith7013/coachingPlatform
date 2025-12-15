'use client'

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react'
import { cn } from '@ui/utils/formatters'
import { tv } from 'tailwind-variants'
// import { textColors, textSize, paddingX, paddingY, radii } from '@ui-tokens/tokens'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDownIcon, UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useAuthenticatedUser, useSignOut } from '@/hooks/auth/useAuthenticatedUser'
import { useResizableSidebar } from '@/hooks/ui/useResizableSidebar'
import { ResizeHandle } from '@/components/composed/layouts/sidebar/ResizeHandle'
import { SidebarControls } from '@/components/composed/layouts/sidebar/SidebarControls'

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
    desktopSidebar: [
      'lg:flex lg:flex-col',
      // 'lg:h-screen', // FIXED: Use viewport height instead of content height
      'transition-all duration-200 ease-out', // Smooth transitions
      'border-r border-gray-200', // Add border to separate from content
      'relative', // For absolute positioned resize handle
      'overflow-hidden' // CHANGE: Prevent container from scrolling
    ],
    
    // Shared sidebar content
    sidebarContent: [
      'flex flex-col gap-y-5 min-h-0', // FIXED: Remove h-full constraint, add min-h-0
      'bg-white px-6 pb-4',
      'select-none', // Prevent text selection during resize
      'flex-1 overflow-hidden' // FIXED: Take available space, contain children
    ],
    
    // User profile section (replaces logo)
    userProfileSection: 'flex h-16 shrink-0 items-center border-b border-gray-200 pb-4',
    userMenuButton: 'flex w-full items-center rounded-md p-2 text-left hover:bg-gray-50',
    userAvatar: 'h-10 w-10 rounded-full bg-gray-50 shrink-0',
    userInfo: 'ml-3 min-w-0 flex-1',
    userName: 'text-sm font-semibold text-gray-900 truncate',
    userEmail: 'text-xs text-gray-500 truncate',
    userChevron: 'ml-2 h-4 w-4 text-gray-400 shrink-0',
    userMenuItems: [
      'absolute left-4 right-4 top-20 z-10 rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5',
      'transition focus:outline-none',
      'data-closed:scale-95 data-closed:transform data-closed:opacity-0',
      'data-enter:duration-100 data-enter:ease-out',
      'data-leave:duration-75 data-leave:ease-in'
    ],
    userMenuItem: 'flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900',
    userMenuIcon: 'mr-3 h-4 w-4',
    
    // Navigation
    nav: [
      'flex flex-1 flex-col',
      'overflow-y-auto', // CHANGE: Move overflow here
      'min-h-0' // CHANGE: Allow flex item to shrink
    ],
    navList: [
      'flex flex-1 flex-col gap-y-7'
    ],
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
  showTeams = true,
  className,
  sidebarOpen,
  setSidebarOpen
}: NavigationSidebarProps) {
  const { fullName, email, imageUrl, isSignedIn } = useAuthenticatedUser();
  const signOut = useSignOut();
  const styles = sidebar();

  // Add resizable functionality
  const {
    sidebarWidth: _sidebarWidth,
    isResizing,
    handleMouseDown,
    sidebarStyle,
    resetWidth,
    isAtMinWidth,
    isAtMaxWidth
  } = useResizableSidebar({
    defaultWidth: 256,
    minWidth: 200,
    maxWidth: 400,
    storageKey: 'navigation-sidebar-width'
  });

  // Function to render user profile section
  const renderUserProfile = () => {
    if (!isSignedIn) return null;

    return (
      <div className={styles.userProfileSection()}>
        <Menu as="div" className="relative w-full">
          <MenuButton className={styles.userMenuButton()}>
            <Image
              className={styles.userAvatar()}
              src={imageUrl || '/default-avatar.png'}
              alt={fullName || 'User'}
              width={40}
              height={40}
              unoptimized
            />
            <div className={styles.userInfo()}>
              <div className={styles.userName()}>
                {fullName || 'User'}
              </div>
              <div className={styles.userEmail()}>
                {email}
              </div>
            </div>
            <ChevronDownIcon className={styles.userChevron()} aria-hidden="true" />
          </MenuButton>
          
          <MenuItems transition className={styles.userMenuItems()}>
            <MenuItem>
              <a href="#" className={styles.userMenuItem()}>
                <UserCircleIcon className={styles.userMenuIcon()} aria-hidden="true" />
                Your Profile
              </a>
            </MenuItem>
            <MenuItem>
              <a href="#" className={styles.userMenuItem()}>
                <Cog6ToothIcon className={styles.userMenuIcon()} aria-hidden="true" />
                Settings
              </a>
            </MenuItem>
            <MenuItem>
              <Link href="/scm/admin/timesheet" className={styles.userMenuItem()}>
                <ClockIcon className={styles.userMenuIcon()} aria-hidden="true" />
                Timesheet
              </Link>
            </MenuItem>
            <div className="border-t border-gray-200 my-1" />
            <MenuItem>
              <button
                onClick={signOut}
                className={cn(styles.userMenuItem(), 'w-full text-left')}
              >
                <ArrowRightOnRectangleIcon className={styles.userMenuIcon()} aria-hidden="true" />
                Sign out
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    );
  };

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
  const renderSidebarContent = () => {
    return (
      <div className={styles.sidebarContent()}>
        {/* User profile - fixed at top */}
        {renderUserProfile()}
        
        {/* Navigation - scrollable content */}
        <nav className={styles.nav()}>
          <ul role="list" className={styles.navList()}>
            <li>
              {renderNavItems(navigation)} {/* Use normal navigation */}
            </li>
            {showTeams && teams.length > 0 && (
              <li>
                {renderTeams()}
              </li>
            )}
          </ul>
        </nav>
        
        {/* Settings - fixed at bottom, outside scrollable area */}
        <div className="mt-auto pt-4 border-t border-gray-200">
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
        </div>
      </div>
    );
  };

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

      {/* Static sidebar for desktop with resize capability */}
      <div 
        className={cn(styles.desktopSidebar(), 'relative', className)}
        style={sidebarStyle} // Apply dynamic width
      >
        {renderSidebarContent()}
        
        {/* Add resize handle */}
        <ResizeHandle
          onMouseDown={handleMouseDown}
          isResizing={isResizing}
          className="hidden lg:block" // Only show on desktop
        />
        
        {/* Optional: Add sidebar controls */}
        <div className="absolute bottom-4 left-2 hidden lg:block">
          <SidebarControls
            isAtMinWidth={isAtMinWidth}
            isAtMaxWidth={isAtMaxWidth}
            onReset={resetWidth}
          />
        </div>
      </div>
    </>
  );
}