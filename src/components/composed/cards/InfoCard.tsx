// src/components/composed/cards/InfoCard.tsx
import { tv, type VariantProps } from 'tailwind-variants';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { EllipsisHorizontalIcon } from '@heroicons/react/20/solid';
import { textColors, backgroundColors, borderColors, paddingX, paddingY } from '@ui-tokens';
import { cn } from "@ui/utils/formatters";

const infoCard = tv({
  slots: {
    container: [
      'overflow-hidden rounded-xl border',
      borderColors.light.secondary,
      'bg-white shadow-sm',
      'h-full',
      'flex flex-col'
    ],
    header: [
      'flex items-center gap-x-4 border-b border-gray-900/5',
      backgroundColors.light.secondary,
      paddingX.md,
      paddingY.md,
      'flex-shrink-0'
    ],
    avatar: [
      'size-12 flex-none rounded-lg bg-white object-cover',
      'ring-1 ring-gray-900/10'
    ],
    title: [
      'text-sm/6 font-medium',
      textColors.default
    ],
    menuButton: [
      '-m-2.5 block p-2.5',
      textColors.muted,
      'hover:text-gray-500'
    ],
    content: [
      '-my-3 divide-y divide-gray-100',
      paddingX.md,
      paddingY.md,
      'text-sm/6',
      'flex-grow'
    ],
    detailRow: 'flex justify-between gap-x-4 py-3',
    detailLabel: textColors.muted,
    detailValue: textColors.secondary,
    detailValueWithBadge: 'flex items-start gap-x-2',
    detailAmount: [
      'font-medium',
      textColors.default
    ],
    actions: [
      '-mt-px flex divide-x divide-gray-200',
      'border-t border-gray-200',
      'flex-shrink-0'
    ],
    actionButton: [
      'relative inline-flex w-0 flex-1 items-center justify-center gap-x-3',
      'border-0 py-4 text-sm font-semibold',
      textColors.default,
      'hover:bg-gray-50',
      'transition-colors duration-150'
    ],
    actionButtonLeft: 'rounded-bl-lg',
    actionButtonRight: 'rounded-br-lg',
    actionIcon: [
      'size-5',
      textColors.muted
    ]
  },
  variants: {
    size: {
      sm: {
        header: 'p-4',
        content: 'px-4 py-3',
        avatar: 'size-8'
      },
      md: {
        header: paddingX.md,
        content: `${paddingX.md} ${paddingY.md}`,
        avatar: 'size-12'
      },
      lg: {
        header: 'p-8',
        content: 'px-8 py-6',
        avatar: 'size-16'
      }
    }
  },
  defaultVariants: {
    size: 'md'
  }
});

const statusBadge = tv({
  base: [
    'rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset'
  ],
  variants: {
    variant: {
      success: 'text-green-700 bg-green-50 ring-green-600/20',
      warning: 'text-yellow-700 bg-yellow-50 ring-yellow-600/20',
      danger: 'text-red-700 bg-red-50 ring-red-600/10',
      neutral: 'text-gray-600 bg-gray-50 ring-gray-500/10',
      info: 'text-blue-700 bg-blue-50 ring-blue-600/20'
    }
  },
  defaultVariants: {
    variant: 'neutral'
  }
});

export type InfoCardVariants = VariantProps<typeof infoCard>;
export type StatusBadgeVariants = VariantProps<typeof statusBadge>;

interface DetailItem {
  label: string;
  value: string | React.ReactNode;
  badge?: {
    text: string;
    variant?: StatusBadgeVariants['variant'];
  };
}

interface ActionButton {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
}

interface MenuAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

interface InfoCardProps extends InfoCardVariants {
  title: string;
  avatar?: {
    src: string;
    alt: string;
  };
  details: DetailItem[];
  actions?: ActionButton[];
  menuActions?: MenuAction[];
  className?: string;
}

function StatusBadge({ 
  children, 
  variant = 'neutral' 
}: { 
  children: React.ReactNode; 
  variant?: StatusBadgeVariants['variant'] 
}) {
  return (
    <div className={statusBadge({ variant })}>
      {children}
    </div>
  );
}

export function InfoCard({
  title,
  // avatar,
  details,
  actions = [],
  menuActions = [],
  size = 'md',
  className
}: InfoCardProps) {
  const styles = infoCard({ size });

  const renderDetailValue = (item: DetailItem) => {
    if (item.badge) {
      return (
        <div className={styles.detailValueWithBadge()}>
          <div className={styles.detailAmount()}>{item.value}</div>
          <StatusBadge variant={item.badge.variant}>
            {item.badge.text}
          </StatusBadge>
        </div>
      );
    }
    return <div className={styles.detailValue()}>{item.value}</div>;
  };

  const renderActionButton = (action: ActionButton, index: number) => {
    const isFirst = index === 0;
    const isLast = index === actions.length - 1;
    
    const buttonClasses = cn(
      styles.actionButton(),
      isFirst && styles.actionButtonLeft(),
      isLast && styles.actionButtonRight()
    );

    const content = (
      <>
        <div className={styles.actionIcon()}>{action.icon}</div>
        {action.label}
      </>
    );

    if (action.href) {
      return (
        <a key={index} href={action.href} className={buttonClasses}>
          {content}
        </a>
      );
    }

    return (
      <button key={index} onClick={action.onClick} className={buttonClasses}>
        {content}
      </button>
    );
  };

  return (
    <div className={cn(styles.container(), className)}>
      {/* Header */}
      <div className={styles.header()}>
        {/* {avatar && (
          <img
            alt={avatar.alt}
            src={avatar.src}
            className={styles.avatar()}
          />
        )} */}
        <div className={styles.title()}>{title}</div>
        
        {menuActions.length > 0 && (
          <Menu as="div" className="relative ml-auto">
            <MenuButton className={styles.menuButton()}>
              <span className="sr-only">Open options</span>
              <EllipsisHorizontalIcon aria-hidden="true" className="size-5" />
            </MenuButton>
            <MenuItems
              transition
              className="absolute right-0 z-10 mt-0.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
            >
              {menuActions.map((action, index) => (
                <MenuItem key={index}>
                  {action.href ? (
                    <a
                      href={action.href}
                      className="block px-3 py-1 text-sm/6 text-gray-900 data-focus:bg-gray-50 data-focus:outline-hidden"
                    >
                      {action.label}
                    </a>
                  ) : (
                    <button
                      onClick={action.onClick}
                      className="block w-full text-left px-3 py-1 text-sm/6 text-gray-900 data-focus:bg-gray-50 data-focus:outline-hidden"
                    >
                      {action.label}
                    </button>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        )}
      </div>

      {/* Details */}
      <dl className={styles.content()}>
        {details.map((item, index) => (
          <div key={index} className={styles.detailRow()}>
            <dt className={styles.detailLabel()}>{item.label}</dt>
            <dd>{renderDetailValue(item)}</dd>
          </div>
        ))}
      </dl>

      {/* Actions */}
      {actions.length > 0 && (
        <div className={styles.actions()}>
          {actions.map(renderActionButton)}
        </div>
      )}
    </div>
  );
}

// Export sub-components for compound usage
InfoCard.StatusBadge = StatusBadge;