// src/components/core/navigation/Pagination.tsx
import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants';
import { 
  textSize, 
  paddingX, 
  paddingY,
  typography,
  radii,
  shadows
} from '@/lib/tokens/tokens';
import { 
  textColors, 
  backgroundColors,
  hoverBackgroundColors
} from '@/lib/tokens/colors';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

const pagination = tv({
  slots: {
    container: 'flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6',
    mobileSection: 'flex flex-1 justify-between sm:hidden',
    desktopSection: 'hidden sm:flex sm:flex-1 sm:items-center sm:justify-between',
    resultsText: `${textSize.sm} ${textColors.muted}`,
    nav: `isolate inline-flex -space-x-px ${radii.md} ${shadows.sm}`,
    button: `relative inline-flex items-center ${textSize.sm} ${typography.weight.semibold} ring-1 ring-gray-300 ring-inset focus:z-20 focus:outline-offset-0`,
    mobileButton: `relative inline-flex items-center ${radii.md} border border-gray-300 ${backgroundColors.surface} ${paddingX.md} ${paddingY.sm} ${textSize.sm} ${typography.weight.medium} ${textColors.muted} ${hoverBackgroundColors.light.muted}`,
    icon: 'size-5',
  },
  variants: {
    buttonType: {
      navigation: {
        button: `${paddingX.sm} ${paddingY.sm} ${textColors.muted} ${hoverBackgroundColors.light.muted}`,
      },
      page: {
        button: `${paddingX.md} ${paddingY.sm} ${textColors.default} ${hoverBackgroundColors.light.muted}`,
      },
      current: {
        button: `z-10 ${backgroundColors.primary} ${paddingX.md} ${paddingY.sm} ${textColors.white} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`,
      },
      ellipsis: {
        button: `${paddingX.md} ${paddingY.sm} ${textColors.muted}`,
      },
    },
    position: {
      first: {
        button: 'rounded-l-md',
      },
      last: {
        button: 'rounded-r-md',
      },
      middle: {
        button: '',
      },
      only: {
        button: radii.md,
      },
    },
    responsive: {
      hidden: {
        button: 'hidden md:inline-flex',
      },
      visible: {
        button: '',
      },
    },
  },
  defaultVariants: {
    buttonType: 'page',
    position: 'middle',
    responsive: 'visible',
  },
});

export type PaginationVariants = VariantProps<typeof pagination>;

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  showResults?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

interface PaginationButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  current?: boolean;
  position?: 'first' | 'last' | 'middle' | 'only';
  responsive?: 'hidden' | 'visible';
  disabled?: boolean;
  className?: string;
}

const PaginationButton = ({
  onClick,
  children,
  current = false,
  position = 'middle',
  responsive = 'visible',
  disabled = false,
  className,
}: PaginationButtonProps) => {
  const { button } = pagination({
    buttonType: current ? 'current' : 'page',
    position,
    responsive,
  });

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-current={current ? 'page' : undefined}
      className={cn(
        button(),
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      {children}
    </button>
  );
};

const PaginationEllipsis = () => {
  const { button } = pagination({ buttonType: 'ellipsis' });
  
  return (
    <span className={button()}>
      ...
    </span>
  );
};

const PaginationNavButton = ({
  direction,
  onClick,
  disabled = false,
  mobile = false,
}: {
  direction: 'previous' | 'next';
  onClick: () => void;
  disabled?: boolean;
  mobile?: boolean;
}) => {
  const IconComponent = direction === 'previous' ? ChevronLeftIcon : ChevronRightIcon;
  
  if (mobile) {
    const { mobileButton } = pagination();
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          mobileButton(),
          disabled && 'opacity-50 pointer-events-none'
        )}
      >
        {direction === 'previous' ? 'Previous' : 'Next'}
      </button>
    );
  }

  const { button, icon } = pagination({
    buttonType: 'navigation',
    position: direction === 'previous' ? 'first' : 'last',
  });

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        button(),
        disabled && 'opacity-50 pointer-events-none'
      )}
    >
      <span className="sr-only">{direction === 'previous' ? 'Previous' : 'Next'}</span>
      <IconComponent aria-hidden="true" className={icon()} />
    </button>
  );
};

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  showResults = true,
  maxVisiblePages = 7,
  className,
}: PaginationProps) => {
  const { container, mobileSection, desktopSection, resultsText, nav } = pagination();

  // Calculate visible page numbers
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - halfVisible);
    const end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start < maxVisiblePages - 1) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const showStartEllipsis = visiblePages[0] > 2;
  const showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1;

  // Calculate results range
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0);

  return (
    <div className={cn(container(), className)}>
      {/* Mobile Navigation */}
      <div className={mobileSection()}>
        <PaginationNavButton
          direction="previous"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          mobile
        />
        <PaginationNavButton
          direction="next"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          mobile
        />
      </div>

      {/* Desktop Navigation */}
      <div className={desktopSection()}>
        {/* Results Text */}
        {showResults && totalItems && (
          <div>
            <p className={resultsText()}>
              Showing <span className={typography.weight.medium}>{startItem}</span> to{' '}
              <span className={typography.weight.medium}>{endItem}</span> of{' '}
              <span className={typography.weight.medium}>{totalItems}</span> results
            </p>
          </div>
        )}

        {/* Pagination Navigation */}
        <div>
          <nav aria-label="Pagination" className={nav()}>
            {/* Previous Button */}
            <PaginationNavButton
              direction="previous"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            />

            {/* First page + ellipsis */}
            {showStartEllipsis && (
              <>
                <PaginationButton
                  onClick={() => onPageChange(1)}
                  current={currentPage === 1}
                >
                  1
                </PaginationButton>
                <PaginationEllipsis />
              </>
            )}

            {/* Visible pages */}
            {visiblePages.map((page, index) => {
              const _isFirst = index === 0 && !showStartEllipsis;
              const _isLast = index === visiblePages.length - 1 && !showEndEllipsis;
              
              return (
                <PaginationButton
                  key={page}
                  onClick={() => onPageChange(page)}
                  current={currentPage === page}
                  responsive={index > 1 && index < visiblePages.length - 2 ? 'hidden' : 'visible'}
                >
                  {page}
                </PaginationButton>
              );
            })}

            {/* Last page + ellipsis */}
            {showEndEllipsis && (
              <>
                <PaginationEllipsis />
                <PaginationButton
                  onClick={() => onPageChange(totalPages)}
                  current={currentPage === totalPages}
                >
                  {totalPages}
                </PaginationButton>
              </>
            )}

            {/* Next Button */}
            <PaginationNavButton
              direction="next"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            />
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;