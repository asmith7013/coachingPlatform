'use client';

import { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/fields/Input';
import { Spinner } from '@/components/core/feedback/Spinner';
import { Alert } from '@/components/core/feedback/Alert';
import { useMondayUserByEmail } from '@/hooks/integrations/monday/useMondayQueries';
import type { MondayUser } from '@/lib/integrations/monday/types/api';

export interface UserFormProps {
  onUserFound?: (user: MondayUser) => void;
  className?: string;
}

export function UserForm({ onUserFound, className }: UserFormProps) {
  const [email, setEmail] = useState('alex.smith@teachinglab.org');
  const [searchStatus, setSearchStatus] = useState<{
    status: 'idle' | 'loading' | 'error' | 'not-found';
    message?: string;
  }>({ status: 'idle' });

  // Use the hook with the current email
  const { data: user, isLoading, error } = useMondayUserByEmail(email);

  const handleSearch = async () => {
    if (!email) return;
    
    setSearchStatus({ status: 'loading' });
    
    try {
      if (user) {
        setSearchStatus({ status: 'idle' });
        onUserFound?.(user);
      } else {
        setSearchStatus({ 
          status: 'not-found', 
          message: `No user found with email ${email}` 
        });
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchStatus({ 
        status: 'error', 
        message: err instanceof Error ? err.message : "An unknown error occurred" 
      });
    }
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Search by email"
            type="email"
            className="flex-1"
          />
          <Button 
            intent="primary"
            onClick={handleSearch}
            disabled={!email || isLoading || searchStatus.status === 'loading'}
          >
            {(isLoading || searchStatus.status === 'loading') ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Searching...
              </>
            ) : "Search"}
          </Button>
        </div>

        {error && (
          <Alert intent="error">
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{error.message}</Alert.Description>
          </Alert>
        )}
        
        {searchStatus.status === 'not-found' && (
          <Alert intent="warning">
            <Alert.Title>Not Found</Alert.Title>
            <Alert.Description>{searchStatus.message}</Alert.Description>
          </Alert>
        )}
      </div>
    </div>
  );
} 