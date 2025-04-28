import React from 'react';
import { cn } from '@ui/utils/formatters';
import { humanFileSize } from '@ui/utils/formatters';
import { tv } from 'tailwind-variants';
import {
  radiusVariant,
  shadowVariant
} from '@ui-variants/shared-variants';
import type { RadiusVariant, ShadowVariant } from '@ui-variants/shared-variants';
import { FiFile, FiX, FiDownload } from 'react-icons/fi';
import { paddingX, paddingY } from '@ui-tokens/tokens';
// File card styling with variants
const fileCard = tv({
  base: 'bg-white flex items-center rounded overflow-hidden',
  variants: {

    radius: radiusVariant.variants.radius,
    shadow: shadowVariant.variants.shadow,
    border: {
      true: 'border border-gray-200',
      false: '',
    },
    variant: {
      outlined: 'border border-gray-200',
      filled: 'bg-gray-50',
      default: '',
    },
    hoverable: {
      true: 'transition-colors duration-200 hover:bg-gray-50',
      false: '',
    },
    padding: {
      sm: `${paddingX.sm} ${paddingY.xs}`,
      md: `${paddingX.md} ${paddingY.sm}`,
      lg: `${paddingX.lg} ${paddingY.md}`,
    },
  },
  defaultVariants: {
    padding: 'sm',
    radius: 'md',
    shadow: 'sm',
    border: true,
    variant: 'default',
    hoverable: true,
  },
});

export type FileCardProps = {
  name: string;
  size?: number;
  type?: string;
  url?: string;
  onRemove?: () => void;
  onDownload?: () => void;
  className?: string;
  fileIcon?: React.ReactNode;
  radius?: RadiusVariant['radius'];
  shadow?: ShadowVariant['shadow'];
  border?: boolean;
  variant?: 'default' | 'outlined' | 'filled';
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg';
};

export function FileCard({
  name,
  size,
  type,
  url,
  onRemove,
  onDownload,
  className,
  fileIcon,
  padding,
  radius,
  shadow,
  border,
  variant,
  hoverable,
}: FileCardProps) {
  return (
    <div
      className={cn(
        fileCard({
          padding,
          radius,
          shadow,
          border,
          variant,
          hoverable,
          className,
        })
      )}
    >
      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 text-blue-500">
        {fileIcon || <FiFile size={20} />}
      </div>
      <div className="flex-grow min-w-0 px-2">
        <div className="truncate font-medium text-sm">{name}</div>
        {(size !== undefined || type) && (
          <div className="text-xs text-gray-500 truncate">
            {size !== undefined && <span>{humanFileSize(size)}</span>}
            {size !== undefined && type && <span className="mx-1">•</span>}
            {type && <span>{type}</span>}
          </div>
        )}
      </div>
      <div className="flex-shrink-0 flex items-center space-x-1">
        {url && onDownload && (
          <button
            onClick={onDownload}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Download file"
          >
            <FiDownload size={16} />
          </button>
        )}
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Remove file"
          >
            <FiX size={16} />
          </button>
        )}
      </div>
    </div>
  );
} 