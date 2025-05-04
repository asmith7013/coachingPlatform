import { cn } from '@ui/utils/formatters';
import { tv } from 'tailwind-variants'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { Button } from '@/components/core/Button'
import { Heading, Text } from '@/components/core/typography'
import { textColors } from '@ui-tokens/tokens'

interface PageHeaderAction {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick?: () => void
  intent?: 'primary' | 'secondary'
  className?: string
}

interface PageHeaderMeta {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  value: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  meta?: PageHeaderMeta[]
  actions?: PageHeaderAction[]
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  gap?: 'sm' | 'md' | 'lg'
}

// 🎨 PageHeader style variants
export const pageHeader = tv({
  slots: {
    root: [
      'flex flex-col lg:flex-row lg:items-center lg:justify-between',
    ],
    content: [
      'min-w-0 flex-1',
    ],
    title: [
      'font-bold sm:truncate text-xl',
      textColors.default,
    ],
    subtitle: [
      'text-base',
      textColors.muted,
    ],
    meta: [
      'flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap',
    ],
    metaItem: [
      'flex items-center text-base',
      textColors.muted,
    ],
    metaIcon: [
      'size-5 shrink-0',
      textColors.muted,
    ],
    actions: [
      'flex lg:mt-0 lg:ml-4',
    ],
    actionItem: [
      'flex',
    ],
    actionIcon: [
      '-ml-0.5 size-5',
    ],
    mobileMenu: [
      'relative sm:hidden',
    ],
    menuButton: [
      'inline-flex items-center rounded-md',
      'text-base font-semibold',
      textColors.default,
      'bg-surface hover:bg-surface-hover',
      'shadow-sm',
    ],
    menuIcon: [
      '-mr-1 size-5',
    ],
    menuItems: [
      'absolute left-0 z-10 -ml-1 w-48 origin-top-left rounded-md',
      'bg-surface',
      'p-4',
      'ring-1 ring-black/5 shadow-lg',
      'transition focus:outline-none',
      'data-closed:scale-95 data-closed:transform data-closed:opacity-0',
      'data-enter:duration-200 data-enter:ease-out',
      'data-leave:duration-75 data-leave:ease-in',
    ],
    menuItem: [
      'block w-full px-4 py-2 text-sm focus:outline-none',
    ],
  },
  variants: {
    padding: {
      sm: { 
        root: 'p-4',
        content: 'p-2', 
        menuItems: 'p-2',
      },
      md: { 
        root: 'p-6',
        content: 'p-3', 
        menuItems: 'p-4',
      },
      lg: { 
        root: 'p-8',
        content: 'p-4', 
        menuItems: 'p-6',
      },
    },
    gap: {
      sm: { 
        root: 'gap-2',
        meta: 'gap-2',
        metaItem: 'gap-2',
        actions: 'gap-2',
        actionItem: 'gap-2',
      },
      md: { 
        root: 'gap-4',
        meta: 'gap-4',
        metaItem: 'gap-4',
        actions: 'gap-4',
        actionItem: 'gap-4',
      },
      lg: { 
        root: 'gap-6',
        meta: 'gap-6',
        metaItem: 'gap-6',
        actions: 'gap-6',
        actionItem: 'gap-6',
      },
    },
  },
  defaultVariants: {
    padding: 'md',
    gap: 'md',
  },
});

// ✅ Export for atomic style use elsewhere
export const pageHeaderStyles = pageHeader;

// ✅ Export type for variant props
export type PageHeaderVariants = Parameters<typeof pageHeader>[0];

export function PageHeader({
  title,
  subtitle,
  meta = [],
  actions = [],
  className,
  gap = 'md',
}: PageHeaderProps) {
  const styles = pageHeader({ gap });

  return (
    <div className={cn(styles.root(), className)}>
      <div className={styles.content()}>
        <Heading 
          level="h2" 
          className={styles.title()}
        >
          {title}
        </Heading>
        
        {subtitle && (
          <Text 
            color="muted"
            className={styles.subtitle()}
          >
            {subtitle}
          </Text>
        )}
        
        {meta.length > 0 && (
          <div className={styles.meta()}>
            {meta.map((item, index) => (
              <div key={index} className={styles.metaItem()}>
                {item.icon && (
                  <item.icon
                    className={styles.metaIcon()}
                    aria-hidden="true"
                  />
                )}
                {item.value}
              </div>
            ))}
          </div>
        )}
      </div>

      {actions.length > 0 && (
        <div className={styles.actions()}>
          {actions.map((action, index) => (
            <span key={index} className={styles.actionItem()}>
              <Button
                type="button"
                intent={action.intent || 'secondary'}
                className={action.className}
                onClick={action.onClick}
              >
                {action.icon && (
                  <action.icon
                    className={styles.actionIcon()}
                    aria-hidden="true"
                  />
                )}
                {action.label}
              </Button>
            </span>
          ))}

          {/* Mobile dropdown menu */}
          <Menu as="div" className={styles.mobileMenu()}>
            <MenuButton className={styles.menuButton()}>
              More
              <ChevronDownIcon
                className={styles.menuIcon()}
                aria-hidden="true"
              />
            </MenuButton>
            <MenuItems
              transition
              className={styles.menuItems()}
            >
              {actions.map((action, index) => (
                <MenuItem key={index}>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={action.onClick}
                      className={cn(
                        styles.menuItem(),
                        active ? 'bg-surface-hover text-primary' : 'text-text'
                      )}
                    >
                      {action.icon && (
                        <action.icon
                          className={styles.actionIcon()}
                          aria-hidden="true"
                        />
                      )}
                      {action.label}
                    </button>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>
      )}
    </div>
  );
}
