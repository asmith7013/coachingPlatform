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
import { spacing, fontSizes, colorVariants, radii, borderColors, textColors } from '@/lib/ui/tokens'
import Image from 'next/image'

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
  const navTextSize = fontSizes.base
  const navTextColor = textColors.primary
  const navTextHoverColor = textColors.secondary
  const navBgColor = variant === 'solid' ? colorVariants.primary : 'bg-transparent'
  const navBorderColor = borderColors.default
  const navItemPadding = spacing.sm
  const navItemRadius = radii.md
  const navItemSpacing = spacing.md
  const iconSize = 'size-6'
  const logoSize = 'size-8'
  const avatarSize = 'size-8'
  const menuWidth = 'w-48'

  return (
    <Disclosure as="nav" className={cn(navBgColor, className)}>
      <div className={cn(
        'mx-auto max-w-7xl',
        spacing.md,
        'border-b',
        navBorderColor
      )}>
        <div className={cn('flex', spacing.lg, 'items-center justify-between')}>
          {/* Left nav */}
          <div className="flex items-center">
            <Image
              className={cn(logoSize, 'w-auto')}
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg"
              alt="Your Company"
              width={32}
              height={32}
            />
            <div className={cn('hidden md:block', navItemSpacing, spacing.md)}>
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    item.current ? navTextColor : navTextHoverColor,
                    navItemRadius,
                    navItemPadding,
                    navTextSize,
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
          <div className={cn('hidden md:flex items-center', spacing.md)}>
            <button
              type="button"
              className={cn(
                'relative',
                navItemRadius,
                navBgColor,
                navItemPadding,
                navTextHoverColor,
                'focus:ring-2 focus:ring-white focus:outline-none'
              )}
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className={iconSize} />
            </button>

            <Menu as="div" className="relative">
              <MenuButton className={cn(
                'flex max-w-xs items-center',
                navItemRadius,
                navTextSize,
                'focus:ring-2 focus:ring-white focus:outline-none'
              )}>
                <Image
                  className={cn(avatarSize, navItemRadius)}
                  src={user.imageUrl}
                  alt=""
                  width={32}
                  height={32}
                />
              </MenuButton>
              <MenuItems className={cn(
                'absolute right-0',
                spacing.sm,
                menuWidth,
                'origin-top-right',
                navItemRadius,
                colorVariants.surface,
                spacing.sm,
                'shadow-lg ring-1 ring-black/5'
              )}>
                {userNavigation.map((item) => (
                  <MenuItem key={item.name}>
                    <a
                      href={item.href}
                      className={cn(
                        'block',
                        spacing.md,
                        spacing.sm,
                        navTextSize,
                        textColors.primary,
                        colorVariants.surfaceHover
                      )}
                    >
                      {item.name}
                    </a>
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <DisclosureButton className={cn(
              'inline-flex items-center justify-center',
              navItemRadius,
              navItemPadding,
              navTextColor,
              'hover:bg-primary-dark focus:ring-2 focus:ring-white focus:outline-none'
            )}>
              <Bars3Icon className={cn(iconSize, 'block data-open:hidden')} />
              <XMarkIcon className={cn(iconSize, 'hidden data-open:block')} />
            </DisclosureButton>
          </div>
        </div>
      </div>

      <DisclosurePanel className={cn(
        'md:hidden',
        'border-t',
        navBorderColor,
        spacing.md,
        spacing.sm
      )}>
        <div className={cn('space-y-1', spacing.sm)}>
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              className={cn(
                item.current ? navTextColor : navTextHoverColor,
                'block',
                navItemRadius,
                navItemPadding,
                navTextSize,
                'font-medium'
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
} 