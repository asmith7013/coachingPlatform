import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NYCPSStaff } from "@/lib/types/core";

interface StaffCardProps {
  staff: NYCPSStaff;
  onDelete: () => void;
}

export function StaffCard({ staff, onDelete }: StaffCardProps) {
  return (
    <Card padding="md" radius="lg">
      <div className="flex justify-between items-center">
        <div>
          <Heading 
            level="h3" 
            color="default"
            className={cn("text-primary font-medium")}
          >
            {staff.staffName}
          </Heading>
          <Text 
            textSize="base"
            color="muted"
            className="mt-2"
          >
            {staff.email || 'No email provided'}
          </Text>
        </div>
        <Button
          onClick={onDelete}
          textSize="sm"
          padding="sm"
          className="text-danger"
        >
          🗑️ Delete
        </Button>
      </div>

      <div className="mt-4">
        <Heading 
          level="h3" 
          color="default"
          className={cn("text-primary font-medium mb-2")}
        >
          Roles
        </Heading>
        <div className="flex flex-wrap gap-2">
          {staff.rolesNYCPS && staff.rolesNYCPS.map((role, index) => (
            <span 
              key={index} 
              className={cn(
                'rounded-full px-3 py-1',
                'text-sm',
                'text-white',
                'bg-primary'
              )}
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <Heading 
          level="h3" 
          color="default"
          className={cn("text-primary font-medium mb-2")}
        >
          Subjects
        </Heading>
        <div className="flex flex-wrap gap-2">
          {staff.subjects && staff.subjects.map((subject, index) => (
            <span 
              key={index} 
              className={cn(
                'rounded-full px-3 py-1',
                'text-sm',
                'text-white',
                'bg-success'
              )}
            >
              {subject}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
} 