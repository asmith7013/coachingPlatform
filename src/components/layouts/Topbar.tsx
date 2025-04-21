'use client'

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { textSize, paddingX, paddingY } from '@/lib/ui/tokens'

interface NavigationItem {
  name: string
  href: string
  current?: boolean
}

interface User {
  name: string
  email: string
  imageUrl: string
}

interface UserNavigationItem {
  name: string
  href: string
}

interface TopbarProps {
  navigation?: NavigationItem[]
  user?: User
  userNavigation?: UserNavigationItem[]
  className?: string
  variant?: 'solid' | 'transparent'
}

// Default data for development
const defaultNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '#', current: true },
  { name: 'Team', href: '#', current: false },
  { name: 'Projects', href: '#', current: false },
]

const defaultUser: User = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?...',
}

const defaultUserNavigation: UserNavigationItem[] = [
  { name: 'Your Profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' },
]

export function Topbar({
  navigation = defaultNavigation,
  user = defaultUser,
  userNavigation = defaultUserNavigation,
  className,
  variant = 'solid',
}: TopbarProps) {
  // Extract token values into constants
  const iconSize = 'size-6'
  const logoSize = 'size-8'

  return (
    <Disclosure as="nav" className={cn(variant === 'solid' ? 'bg-primary' : 'bg-transparent', className)}>
      <div className={cn(
        'mx-auto max-w-7xl',
        `${paddingX.md} ${paddingY.md}`,
        'border-b border-outline'
      )}>
        <div className={cn('flex', `${paddingX.lg} ${paddingY.lg}`, 'items-center justify-between')}>
          {/* Left nav */}
          <div className="flex items-center">
            <Image
              className={cn(logoSize, 'w-auto')}
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg"
              alt="Your Company"
              width={32}
              height={32}
            />
            <div className={cn('hidden md:block', `${paddingX.md} ${paddingY.md}`)}>
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    item.current ? 'text-primary' : 'text-secondary hover:text-primary',
                    'rounded-md',
                    `${paddingX.sm} ${paddingY.sm}`,
                    textSize.base,
                    'font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className={cn('hidden md:flex items-center', `${paddingX.md} ${paddingY.md}`)}>
            <button
              type="button"
              className={cn(
                'relative rounded-md',
                variant === 'solid' ? 'bg-primary' : 'bg-transparent',
                `${paddingX.sm} ${paddingY.sm}`,
                'text-secondary hover:text-primary',
                'focus:ring-2 focus:ring-white focus:outline-none'
              )}
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className={iconSize} />
            </button>

            <Menu as="div" className="relative">
              <MenuButton className={cn(
                'flex max-w-xs items-center rounded-md',
                textSize.base,
                'focus:ring-2 focus:ring-white focus:outline-none'
              )}>
                <Image
                  className={cn(logoSize, 'rounded-md')}
                  src={user.imageUrl}
                  alt=""
                  width={32}
                  height={32}
                />
              </MenuButton>
              <MenuItems className={cn(
                'absolute right-0',
                `${paddingX.sm} ${paddingY.sm}`,
                'w-48',
                'origin-top-right rounded-md',
                'bg-surface',
                `${paddingX.sm} ${paddingY.sm}`,
                'shadow-lg',
                'ring-1 ring-black/5'
              )}>
                {userNavigation.map((item) => (
                  <MenuItem key={item.name}>
                    {({ active }) => (
                      <a
                        href={item.href}
                        className={cn(
                          'block px-4 py-2',
                          textSize.sm,
                          active ? 'bg-surface-hover text-primary' : 'text-text'
                        )}
                      >
                        {item.name}
                      </a>
                    )}
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <DisclosureButton className={cn(
              'inline-flex items-center justify-center rounded-md',
              `${paddingX.sm} ${paddingY.sm}`,
              'text-primary',
              'hover:bg-primary-dark focus:ring-2 focus:ring-white focus:outline-none'
            )}>
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className={cn(iconSize, 'block')} aria-hidden="true" />
              <XMarkIcon className={cn(iconSize, 'hidden')} aria-hidden="true" />
            </DisclosureButton>
          </div>
        </div>
      </div>

      <DisclosurePanel className={cn(
        'md:hidden',
        'bg-surface',
        'border-b border-outline'
      )}>
        <div className={cn(`${paddingX.sm} ${paddingY.sm}`, 'space-y-1')}>
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                item.current ? 'bg-primary text-white' : 'text-text hover:bg-surface-hover hover:text-primary',
                'block rounded-md',
                `${paddingX.md} ${paddingY.md}`,
                textSize.base,
                'font-medium'
              )}
              aria-current={item.current ? 'page' : undefined}
            >
              {item.name}
            </a>
          ))}
        </div>
        <div className={cn(`${paddingX.md} ${paddingY.md}`, 'border-t border-border')}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Image
                className="h-10 w-10 rounded-full"
                src={user.imageUrl}
                alt=""
                width={40}
                height={40}
              />
            </div>
            <div className="ml-3">
              <div className={cn(textSize.base, 'font-medium text-text')}>{user.name}</div>
              <div className={cn(textSize.sm, 'text-muted')}>{user.email}</div>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            {userNavigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  'block rounded-md',
                  `${paddingX.md} ${paddingY.md}`,
                  textSize.base,
                  'text-text hover:bg-surface-hover hover:text-primary'
                )}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
} 