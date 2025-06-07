'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/core';
import { Alert } from '@/components/core/feedback';
import { Spinner } from '@/components/core/feedback';
import { Card } from '@/components/composed/cards';
import { useErrorHandledMutation } from '@/query/client/hooks/mutations/useStandardMutation';
import { cn } from '@/lib/ui/utils/formatters';
import { textSize, color as textColors } from '@/lib/tokens/typography';
import { paddingX, paddingY, stack } from '@/lib/tokens/spacing';

export default function SetupPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [setupStatus, setSetupStatus] = useState<'idle' | 'checking' | 'ready' | 'setting-up' | 'complete' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Check if user is already set up
  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push('/sign-in');
      return;
    }

    const checkUserSetup = async () => {
      setSetupStatus('checking');
      
      // Check if user already has metadata
      if (user.publicMetadata?.staffId) {
        setSetupStatus('complete');
        router.push('/dashboard');
        return;
      }
      
      setSetupStatus('ready');
    };

    checkUserSetup();
  }, [isLoaded, user, router]);

// Setup mutation
const { mutate: setupUser, isPending, error } = useErrorHandledMutation(
    async () => {
      if (!user) throw new Error('No user found');
      
      const response = await fetch('/api/setup/initial-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.primaryEmailAddress?.emailAddress,
          clerkUserId: user.id,
          fullName: user.fullName || user.firstName + ' ' + user.lastName || 'Unknown User'
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Setup failed');
      }
      
      return response.json();
    },
    {},
    "UserSetup"
  );
  
  // Handle error with useEffect
  useEffect(() => {
    if (error) {
      setSetupStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Setup failed');
    }
  }, [error]);

  const handleSetup = () => {
    setupUser(undefined, {
      onSuccess: () => {
        setSetupStatus('complete');
        // Reload user to get updated metadata
        user?.reload().then(() => {
          router.push('/dashboard');
        });
      }
    });
  };

  // Render based on status
  if (!isLoaded || setupStatus === 'checking') {
    return (
      <div className={cn('min-h-screen flex items-center justify-center', paddingX.lg, paddingY.lg)}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (setupStatus === 'error') {
    return (
      <div className={cn('min-h-screen flex items-center justify-center', paddingX.lg, paddingY.lg)}>
        <Card className="max-w-md w-full">
          <Card.Header>Setup Error</Card.Header>
          <Card.Body>
            <Alert intent="error">
              <Alert.Title>Setup Failed</Alert.Title>
              <Alert.Description>{errorMessage}</Alert.Description>
            </Alert>
            <Button 
              onClick={handleSetup}
              intent="primary"
              className="w-full mt-4"
            >
              Try Again
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen flex items-center justify-center', paddingX.lg, paddingY.lg)}>
      <Card className="max-w-md w-full">
        <Card.Header>
          <h1 className={cn(textSize['2xl'], textColors.default, 'font-bold text-center')}>
            Welcome to Coaching Platform
          </h1>
        </Card.Header>
        <Card.Body>
          <div className={cn(stack.lg)}>
            <p className={cn(textColors.muted, textSize.base, 'text-center')}>
              Let&apos;s set up your account to get started.
            </p>
            
            <div className={cn('bg-gray-50 p-4 rounded-lg', stack.sm)}>
              <p className={cn(textSize.sm, textColors.default)}>
                <strong>Email:</strong> {user?.primaryEmailAddress?.emailAddress}
              </p>
              <p className={cn(textSize.sm, textColors.default)}>
                <strong>Name:</strong> {user?.fullName || 'Not provided'}
              </p>
            </div>
            
            <Button 
              onClick={handleSetup}
              disabled={isPending || setupStatus !== 'ready'}
              loading={isPending}
              intent="primary"
              className="w-full"
            >
              Complete Setup
            </Button>
            
            <p className={cn(textSize.xs, textColors.muted, 'text-center')}>
              This will create your staff profile and grant you access to the platform.
            </p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
} 