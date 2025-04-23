'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { tv, type VariantProps } from 'tailwind-variants'
import { textColors, textSize, weight, radii, paddingX, paddingY } from '@ui-tokens/tokens'

const tabs = tv({
  slots: {
    container: 'border-b border-surface',
    list: 'flex flex-wrap -mb-px',
    tab: [
      'inline-flex items-center justify-center font-medium',
      'border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      'transition-colors duration-200 ease-in-out'
    ],
    panel: 'py-4',
  },
  variants: {
    textSize: {
      xs: { 
        tab: [textSize.xs, 'px-2 py-2'],
        panel: textSize.xs,
      },
      sm: { 
        tab: [textSize.sm, 'px-3 py-2'],
        panel: textSize.sm,
      },
      base: { 
        tab: [textSize.base, 'px-4 py-3'],
        panel: textSize.base,
      },
      lg: { 
        tab: [textSize.lg, 'px-5 py-3'],
        panel: textSize.lg,
      },
      xl: { 
        tab: [textSize.xl, 'px-6 py-4'],
        panel: textSize.xl,
      },
    },
    rounded: {
      none: { tab: radii.none },
      sm: { tab: radii.sm },
      md: { tab: radii.md },
      lg: { tab: radii.lg },
      full: { tab: radii.full },
    },
    active: {
      true: { 
        tab: [
          'border-primary text-primary',
          weight.semibold
        ] 
      },
      false: { 
        tab: [
          'border-transparent', 
          textColors.muted,
          'hover:text-primary hover:border-muted'
        ] 
      },
    },
    fullWidth: {
      true: { 
        list: 'flex w-full',
        tab: 'flex-1 text-center'
      },
      false: {}
    },
    density: {
      compact: { tab: `${paddingX.sm} ${paddingY.xs}` },
      default: {},
      spacious: { tab: `${paddingX.lg} ${paddingY.md}` },
    }
  },
  defaultVariants: {
    textSize: 'base',
    rounded: 'none',
    fullWidth: false,
    density: 'default'
  },
})

export type TabsVariants = VariantProps<typeof tabs>

export interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

export interface TabsProps extends TabsVariants {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (id: string) => void
  className?: string
}

export function Tabs({
  tabs: tabItems,
  defaultTab,
  onChange,
  textSize = 'base',
  rounded = 'none',
  fullWidth = false,
  density = 'default',
  className,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabItems[0]?.id)
  const styles = tabs({ textSize, rounded, fullWidth, density })

  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id)
    onChange?.(id)
  }, [onChange])

  return (
    <div className={cn(className)}>
      <div className={styles.container()}>
        <ul className={styles.list()} role="tablist">
          {tabItems.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <li key={tab.id} role="presentation">
                <button
                  id={`tab-${tab.id}`}
                  className={styles.tab({ active: isActive })}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="tab-content">
        {tabItems.map((tab) => (
          <div
            key={tab.id}
            id={`panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            className={cn(
              styles.panel(),
              activeTab !== tab.id && 'hidden'
            )}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
} 