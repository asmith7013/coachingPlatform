import { Spinner } from '@/components/core/feedback';
import { cn } from '@/lib/ui/utils/formatters';
import { stack } from '@/lib/tokens/spacing';
import { textSize, color as textColors } from '@/lib/tokens/typography';

export function AuthLoading() {
  return (
    <div className={cn('min-h-screen flex items-center justify-center', stack.lg)}>
      <div className="text-center">
        <Spinner size="lg" />
        <p className={cn(textSize.base, textColors.muted, 'mt-4')}>
          Loading user data...
        </p>
      </div>
    </div>
  );
} 