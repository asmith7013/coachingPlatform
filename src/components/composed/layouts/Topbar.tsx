'use client'

import { useState } from 'react'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react'
import {
  MagnifyingGlassIcon,
  BellIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { cn } from '@ui/utils/formatters'
import { tv } from 'tailwind-variants'
import { Text } from '@/components/core/typography/Text'
import { Input } from '@/components/core/fields/Input'
import { Button } from '@/components/core/Button'
import Image from 'next/image'
import Link from 'next/link'
import { useAuthenticatedUser, useSignOut } from '@/hooks/auth/useAuthenticatedUser'
import { backgroundColors, borderColors, semanticColors } from '@/lib/tokens/colors'
import { textColors } from '@/lib/tokens/tokens'

interface UserNavigationItem {
  name: string
  href: string
}

interface TopbarProps {
  isSidebarOpen?: boolean
  onSidebarToggle?: () => void
  user?: {
    name: string
    email: string
    imageUrl: string
  }
  userNavigation?: UserNavigationItem[]
  className?: string
}

// Default user data for development
const defaultUser = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}

// Default user navigation
const defaultUserNavigation = [
  { name: 'Your profile', href: '#' },
  { name: 'Sign out', href: '#' },
]

// Create topbar styles using tv from tailwind-variants
const topbarStyles = tv({
  slots: {
    container: 'sticky top-0 z-40 lg:mx-auto lg:max-w-7xl lg:px-8',
    header: 'flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-0 lg:shadow-none',
    mobileButton: '-m-2.5 p-2.5 text-gray-700 lg:hidden',
    divider: 'h-6 w-px bg-gray-200 lg:hidden',
    searchContainer: 'flex items-center flex-1 gap-x-4 self-stretch lg:gap-x-6',
    searchWrapper: 'relative flex flex-1 max-w-md',
    searchIcon: 'pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 pl-3',
    searchIconSvg: 'h-5 w-5 text-gray-400',
    searchInput: cn(
      'h-8 w-full rounded-md border-0',
      'bg-gray-50 py-1 text-sm text-gray-900 pl-10',
      'placeholder:text-gray-400',
      'focus:ring-2 focus:ring-primary-500 focus:bg-white'
    ),
    actionContainer: 'flex items-center gap-x-4 lg:gap-x-6',
    notificationBtn: '-m-2.5 p-2.5 text-gray-400 hover:text-gray-500',
    notificationIcon: 'h-6 w-6',
    userDivider: 'hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200',
    userMenuBtn: 'flex items-center p-1.5',
    userAvatar: 'h-8 w-8 rounded-full bg-gray-50',
    userInfo: 'hidden lg:flex lg:items-center',
    userName: 'ml-4 text-sm font-semibold text-gray-900',
    userMenuIcon: 'ml-2 h-5 w-5 text-gray-400',
    menuItems: [
      'absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5',
      'transition focus:outline-none',
      'data-closed:scale-95 data-closed:transform data-closed:opacity-0',
      'data-enter:duration-100 data-enter:ease-out',
      'data-leave:duration-75 data-leave:ease-in'
    ],
    menuItem: 'block px-3 py-1 text-sm leading-6 text-gray-900 data-focus:bg-gray-50 data-focus:outline-none'
  }
});

export function Topbar({ className }: TopbarProps) {
  const { fullName, email, imageUrl, isSignedIn } = useAuthenticatedUser();
  const signOut = useSignOut();
  const [isSearching, setIsSearching] = useState(false);
  const styles = topbarStyles();
  
  if (!isSignedIn) {
    return null;
  }
  
  return (
    <div className={cn(styles.container(), className)}>
      <div className={styles.header()}>
        {/* Search */}
        <div className={styles.searchContainer()}>
          <div className={styles.searchWrapper()}>
            <div className={styles.searchIcon()}>
              <MagnifyingGlassIcon
                className={styles.searchIconSvg()}
                aria-hidden="true"
              />
            </div>
            <input
              id="search-field"
              placeholder="Search..."
              className={styles.searchInput()}
              type="search"
              name="search"
              onFocus={() => setIsSearching(true)}
              onBlur={() => setIsSearching(false)}
            />
          </div>
        </div>
        
        {/* Profile menu */}
        <div className={styles.actionContainer()}>
          <Menu as="div" className="relative">
            <MenuButton className={styles.userMenuBtn()}>
              <span className="sr-only">Open user menu</span>
              <img
                className={styles.userAvatar()}
                src={imageUrl || '/default-avatar.png'}
                alt={fullName || 'User'}
              />
              <span className={styles.userInfo()}>
                <span className={styles.userName()}>
                  {fullName || email}
                </span>
                <ChevronDownIcon className={styles.userMenuIcon()} aria-hidden="true" />
              </span>
            </MenuButton>
            
            <MenuItems transition className={styles.menuItems()}>
              <MenuItem>
                {({ focus }) => (
                  <a
                    href="#"
                    className={cn(
                      styles.menuItem(),
                      'flex items-center',
                      focus ? semanticColors.hoverBg.default : ''
                    )}
                  >
                    <UserCircleIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                    Your Profile
                  </a>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <a
                    href="#"
                    className={cn(
                      styles.menuItem(),
                      'flex items-center',
                      focus ? semanticColors.hoverBg.default : ''
                    )}
                  >
                    <Cog6ToothIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                    Settings
                  </a>
                )}
              </MenuItem>
              <div className={cn("border-t", borderColors.default)} />
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={signOut}
                    className={cn(
                      styles.menuItem(),
                      'flex w-full items-center text-left',
                      focus ? semanticColors.hoverBg.default : ''
                    )}
                  >
                    <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                    Sign out
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>
    </div>
  )
}