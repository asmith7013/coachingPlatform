import { useRouter } from 'next/navigation';
import { Button } from '@/components/core';
import { textSize, color as textColors } from '@/lib/tokens/typography';
import { paddingX, paddingY } from '@/lib/tokens/spacing';
import { cn } from '@/lib/ui/utils/formatters';

export default function UnauthorizedPage() {
  const router = useRouter();
  
  return (
    <div className={cn('min-h-screen flex items-center justify-center', paddingX.lg, paddingY.lg)}>
      <div className="text-center">
        <h1 className={cn(textSize['2xl'], textColors.default, 'font-bold mb-4')}>
          Access Denied
        </h1>
        <p className={cn(textColors.muted, textSize.base, 'mb-8')}>
          You don't have permission to access this page.
        </p>
        <Button 
          onClick={() => router.push('/dashboard')}
          intent="primary"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
} 