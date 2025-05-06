'use client'

// import { Fragment } from 'react'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
//   TransitionChild
} from '@headlessui/react'
// import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { cn } from '@ui/utils/formatters'
import { tv } from 'tailwind-variants'
// import { textColors, textSize, paddingX, paddingY, radii } from '@ui-tokens/tokens'
import { Text } from '@/components/core/typography/Text'
import { Input } from '@/components/core/fields/Input'
import { Button } from '@/components/core/Button'
import Image from 'next/image'
import Link from 'next/link'

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
const topbar = tv({
  slots: {
    container: 'sticky top-0 z-40 lg:mx-auto lg:max-w-7xl lg:px-8',
    header: 'flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-0 lg:shadow-none',
    mobileButton: '-m-2.5 p-2.5 text-gray-700 lg:hidden',
    divider: 'h-6 w-px bg-gray-200 lg:hidden',
    searchContainer: 'flex items-center flex-1 gap-x-4 self-stretch lg:gap-x-6',
    searchForm: 'relative flex flex-1',
    searchInput: 'border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm',
    searchIcon: 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400',
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
      'absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5',
      'transition focus:outline-none',
      'data-closed:scale-95 data-closed:transform data-closed:opacity-0',
      'data-enter:duration-100 data-enter:ease-out',
      'data-leave:duration-75 data-leave:ease-in'
    ],
    menuItem: 'block px-3 py-1 text-sm leading-6 text-gray-900 data-focus:bg-gray-50 data-focus:outline-none'
  }
});

export function Topbar({
  isSidebarOpen,
  onSidebarToggle,
  user = defaultUser,
  userNavigation = defaultUserNavigation,
  className,
}: TopbarProps) {
  const styles = topbar();

  const _isSidebarOpen = isSidebarOpen ?? false;

  return (
    <div className={cn(styles.container(), className)}>
      <div className={styles.header()}>
        {/* Mobile menu button */}
        {onSidebarToggle && (
          <Button
            intent="secondary"
            appearance="outline"
            padding="sm"
            onClick={onSidebarToggle}
            className={styles.mobileButton()}
            aria-label="Open sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </Button>
        )}

        {/* Separator */}
        <div className={styles.divider()} aria-hidden="true" />


        <div className={styles.searchContainer()}>
          <form className={styles.searchForm()}>
            <label htmlFor="search-field" className="sr-only">
              Search
            </label>
            <div className="relative w-full">
              {/* <MagnifyingGlassIcon
                className={styles.searchIcon()}
                aria-hidden="true"
              /> */}
              <Input
                id="search-field"
                type="search"
                name="search"
                placeholder="Search"
                className={styles.searchInput()}
                textSize="sm"
                radius="md"
                // padding="none"
              />
            </div>
          </form>

          <div className={styles.actionContainer()}>
            {/* Notification button */}
            {/* <Button
              intent="secondary"
              appearance="outline"
              padding="sm"
              className={styles.notificationBtn()}
              aria-label="View notifications"
            >
              <BellIcon className={styles.notificationIcon()} aria-hidden="true" />
            </Button> */}

            {/* Separator */}
            <div className={styles.userDivider()} aria-hidden="true" />

            {/* Profile dropdown */}
            <Menu as="div" className="relative">
              <MenuButton className={styles.userMenuBtn()}>
                <span className="sr-only">Open user menu</span>
                <Image
                  className={styles.userAvatar()}
                  src={user.imageUrl}
                  alt=""
                  width={32}
                  height={32}
                />
                <span className={styles.userInfo()}>
                  <Text 
                    as="span"
                    textSize="sm"
                    weight="semibold"
                    color="default"
                    className={cn("ml-4")}
                  >
                    {user.name}
                  </Text>
                  <ChevronDownIcon className={styles.userMenuIcon()} aria-hidden="true" />
                </span>
              </MenuButton>
              <MenuItems
                transition
                className={styles.menuItems()}
              >
                {userNavigation.map((item) => (
                  <MenuItem key={item.name}>
                    {({ active }) => (
                      <Link
                        href={item.href}
                        className={cn(
                          styles.menuItem(),
                          active ? 'bg-gray-50' : ''
                        )}
                      >
                        <Text
                          as="span"
                          textSize="sm"
                          color="default"
                        >
                          {item.name}
                        </Text>
                      </Link>
                    )}
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  )
}