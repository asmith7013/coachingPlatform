import { BoardFinder } from '@/components/domain/monday';
import { PageHeader } from '@/components/shared/PageHeader';

export default function MondayPage() {
  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Monday.com Integration"
        subtitle="Look up a Monday.com board by ID"
      />
      
      <div className="my-6">
        <BoardFinder />
      </div>
    </div>
  );
} 