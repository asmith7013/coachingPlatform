import { useAuthenticatedUser } from '@/hooks/auth/useAuthenticatedUser';
import { useUserStaff } from '@/hooks/domain/useUserStaff';
import { Card } from '@/components/composed/cards';
import { Badge } from '@/components/core/feedback';
import { textSize, color as textColors } from '@/lib/tokens/typography';
import { cn } from '@/lib/ui/utils/formatters';
import { stack } from '@/lib/tokens/spacing';

export function UserProfile() {
  const { fullName, email, metadata } = useAuthenticatedUser();
  const { staff, isLoading } = useUserStaff();
  
  return (
    <Card>
      <Card.Header>User Profile</Card.Header>
      <Card.Body>
        <div className={cn(stack.md)}>
          <div>
            <h3 className={cn(textSize.sm, textColors.muted)}>Full Name</h3>
            <p className={cn(textSize.base, textColors.default)}>{fullName}</p>
          </div>
          
          <div>
            <h3 className={cn(textSize.sm, textColors.muted)}>Email</h3>
            <p className={cn(textSize.base, textColors.default)}>{email}</p>
          </div>
          
          <div>
            <h3 className={cn(textSize.sm, textColors.muted)}>Roles</h3>
            <div className={cn(stack.xs, 'flex flex-wrap')}>
              {metadata.roles.map(role => (
                <Badge key={role} intent="primary">{role}</Badge>
              ))}
            </div>
          </div>
          
          {staff && !isLoading && (
            <div>
              <h3 className={cn(textSize.sm, textColors.muted)}>Staff Information</h3>
              <p className={cn(textSize.base, textColors.default)}>
                {staff.staffName} - {metadata.staffType}
              </p>
            </div>
          )}
          
          <div>
            <h3 className={cn(textSize.sm, textColors.muted)}>Permissions</h3>
            <div className={cn(textSize.xs, textColors.muted, 'max-h-32 overflow-y-auto')}>
              {metadata.permissions.length > 0 
                ? metadata.permissions.join(', ')
                : 'No direct permissions assigned (using role-based permissions)'
              }
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
} 