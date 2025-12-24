'use client';

import { ReactNode } from 'react';

export type FooterTheme = 'purple' | 'green' | 'blue' | 'amber' | 'yellow' | 'gray';

interface WizardStickyFooterProps {
  children: ReactNode;
  /** Theme determines the background and border color */
  theme?: FooterTheme;
  /** Use the loading/active variant of the theme (darker background) */
  isActive?: boolean;
}

/**
 * Shared sticky footer component for the worked examples wizard.
 *
 * Provides consistent positioning, border styling, and theming across all wizard steps.
 * The top border color matches the theme for visual consistency.
 */
export function WizardStickyFooter({
  children,
  theme = 'gray',
  isActive = false,
}: WizardStickyFooterProps) {
  const themeConfig: Record<FooterTheme, { border: string; bg: string; activeBg: string }> = {
    purple: {
      border: 'border-purple-300',
      bg: 'bg-purple-50',
      activeBg: 'bg-purple-100',
    },
    green: {
      border: 'border-green-300',
      bg: 'bg-green-50',
      activeBg: 'bg-green-100',
    },
    blue: {
      border: 'border-blue-300',
      bg: 'bg-blue-50',
      activeBg: 'bg-blue-100',
    },
    amber: {
      border: 'border-amber-300',
      bg: 'bg-amber-50',
      activeBg: 'bg-amber-100',
    },
    yellow: {
      border: 'border-yellow-300',
      bg: 'bg-yellow-50',
      activeBg: 'bg-yellow-100',
    },
    gray: {
      border: 'border-gray-300',
      bg: 'bg-gray-50',
      activeBg: 'bg-gray-100',
    },
  };

  const config = themeConfig[theme];
  const bgClass = isActive ? config.activeBg : config.bg;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-20 border-t ${config.border} shadow-md bg-white`}>
      <div className={`px-11 pt-2 pb-4 ${bgClass}`}>
        {children}
      </div>
    </div>
  );
}
