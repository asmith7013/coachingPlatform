import { cn } from '@/lib/utils'
import { spacing, fontSizes, colorVariants, textColors, radii } from '@/lib/ui/tokens'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { Button } from '@/components/ui/button'

interface PageHeaderAction {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick?: () => void
  variant?: 'primary' | 'secondary'
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
  padding?: keyof typeof spacing
  gap?: keyof typeof spacing
}

export function PageHeader({
  title,
  subtitle,
  meta = [],
  actions = [],
  className,
  gap = 'md',
}: PageHeaderProps) {
  // Extract token values into constants
  const gapClass = spacing[gap]
  const titleSize = fontSizes.xl
  const subtitleSize = fontSizes.base
  const metaSize = fontSizes.base
  const buttonSize = fontSizes.base
  const radiusClass = radii.md

  // Color tokens
  const titleColor = textColors.primary
  const subtitleColor = textColors.secondary
  const metaColor = textColors.secondary
  const iconColor = textColors.muted
  const surfaceColor = colorVariants.surface
  const surfaceHoverColor = colorVariants.surfaceHover
  const dropdownTextColor = textColors.primary
  const dropdownHoverColor = colorVariants.surfaceHover

  // Spacing tokens
  const metaGap = spacing.lg
  const metaItemGap = spacing.sm
  const actionGap = spacing.md
  const actionItemGap = spacing.sm
  const dropdownGap = spacing.sm
  const dropdownPadding = spacing.md

  return (
    <div className={cn('flex flex-col lg:flex-row lg:items-center lg:justify-between', gapClass, className)}>
      <div className="min-w-0 flex-1">
        <h2 className={cn('font-bold sm:truncate', titleSize, titleColor)}>
          {title}
        </h2>
        {subtitle && (
          <p className={cn(metaItemGap, subtitleSize, subtitleColor)}>
            {subtitle}
          </p>
        )}
        {meta.length > 0 && (
          <div className={cn(
            metaItemGap,
            'flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap',
            metaGap
          )}>
            {meta.map((item, index) => (
              <div key={index} className={cn('flex items-center', metaSize, metaColor)}>
                {item.icon && (
                  <item.icon
                    className={cn(metaItemGap, 'size-5 shrink-0', iconColor)}
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
        <div className={cn(
          actionGap,
          'flex lg:mt-0 lg:ml-4',
          actionGap
        )}>
          {actions.map((action, index) => (
            <span key={index} className={cn(index > 0 && actionItemGap)}>
              <Button
                onClick={action.onClick}
                variant={action.variant || 'secondary'}
                className={action.className}
              >
                {action.icon && (
                  <action.icon
                    className={cn(metaItemGap, '-ml-0.5 size-5')}
                    aria-hidden="true"
                  />
                )}
                {action.label}
              </Button>
            </span>
          ))}

          {/* Mobile dropdown menu */}
          <Menu as="div" className={cn('relative', actionItemGap, 'sm:hidden')}>
            <MenuButton className={cn(
              'inline-flex items-center',
              radiusClass,
              dropdownPadding,
              buttonSize,
              'font-semibold',
              titleColor,
              surfaceColor,
              surfaceHoverColor,
              'shadow-xs'
            )}>
              More
              <ChevronDownIcon
                className={cn('-mr-1', metaItemGap, 'size-5')}
                aria-hidden="true"
              />
            </MenuButton>
            <MenuItems
              transition
              className={cn(
                'absolute left-0 z-10',
                dropdownGap,
                '-ml-1 w-48 origin-top-left',
                radiusClass,
                surfaceColor,
                dropdownPadding,
                'ring-1 ring-black/5',
                'shadow-lg',
                'transition focus:outline-hidden',
                'data-closed:scale-95 data-closed:transform data-closed:opacity-0',
                'data-enter:duration-200 data-enter:ease-out',
                'data-leave:duration-75 data-leave:ease-in'
              )}
            >
              {actions.map((action, index) => (
                <MenuItem key={index}>
                  <button
                    onClick={action.onClick}
                    className={cn(
                      'block w-full',
                      dropdownPadding,
                      buttonSize,
                      dropdownTextColor,
                      dropdownHoverColor,
                      'data-focus:outline-hidden'
                    )}
                  >
                    {action.label}
                  </button>
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>
      )}
    </div>
  )
}
