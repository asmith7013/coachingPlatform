'use client';

import { useState, useRef, useEffect } from 'react';
import { Alert } from '@/components/core/feedback/Alert';
import { Card } from '@/components/composed/cards/Card';
import { UserForm } from './UserForm';
import { UserDetails } from './UserDetails';
import { MondayUser } from '@/lib/integrations/monday/types';
import { ConnectionTest } from '../../common';

// Extended MondayUser interface for additional properties
interface ExtendedMondayUser extends MondayUser {
  photo_thumb?: string;
  title?: string;
}

// Basic staff member type for compatibility with existing code
export interface StaffMember {
  _id: string;
  staffName: string;
  email: string;
  mondayId?: string;
  [key: string]: string | undefined;
}

export interface MondayUserFinderProps {
  onUserSelect?: (user: MondayUser) => void;
  onStaffCreated?: (staff: StaffMember) => void;
  className?: string;
}

export function MondayUserFinder({ onUserSelect, onStaffCreated, className }: MondayUserFinderProps) {
  const [selectedUser, setSelectedUser] = useState<ExtendedMondayUser | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Keep track of timeouts to clear them
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleUserFound = (user: MondayUser) => {
    // Clear any existing timeout to avoid state updates after component unmount
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Clear success message when searching for a new user
    setSuccessMessage(null);
    
    // Create an extended user with optional properties that might be available
    const extendedUser: ExtendedMondayUser = {
      ...user,
      // These properties may not exist in the base MondayUser type
      photo_thumb: (user as ExtendedMondayUser).photo_thumb,
      title: (user as ExtendedMondayUser).title
    };
    
    setSelectedUser(extendedUser);
    onUserSelect?.(user);
  };

  const handleStaffCreated = () => {
    setSuccessMessage('Staff member created successfully');
    
    // If there's a callback, we'll call it with some synthetic staff data
    if (onStaffCreated && selectedUser) {
      const newStaff: StaffMember = {
        _id: `staff-${selectedUser.id}`,
        staffName: selectedUser.name,
        email: selectedUser.email,
        mondayId: selectedUser.id
      };
      
      onStaffCreated(newStaff);
    }
    
    // Reset after a few seconds
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setSuccessMessage(null);
      timeoutRef.current = null;
    }, 5000);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Card className={className}>
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Find Monday User</h2>
        <p className="text-sm text-gray-500">
          Search for a user on Monday.com by email
        </p>
        <div className="mt-4">
          <ConnectionTest />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {successMessage && (
          <Alert intent="success">
            <Alert.Title>Success</Alert.Title>
            <Alert.Description>{successMessage}</Alert.Description>
          </Alert>
        )}
      
        {/* Search form */}
        <UserForm onUserFound={handleUserFound} />
        
        {/* User details if a user is selected */}
        {selectedUser && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">User Details</h3>
            <UserDetails 
              user={selectedUser}
              onStaffCreated={handleStaffCreated}
            />
          </div>
        )}
      </div>
    </Card>
  );
} 