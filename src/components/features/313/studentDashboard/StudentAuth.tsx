'use client';

import { useState } from 'react';
import { Card } from '@/components/composed/cards/Card';
import { Input } from '@/components/core/fields/Input';
import { Button } from '@/components/core/Button';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';

interface StudentAuthProps {
  onAuthenticate: (email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function StudentAuth({ onAuthenticate, isLoading, error }: StudentAuthProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      await onAuthenticate(email.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <Card.Header>
          <div className="text-center space-y-2">
            <Heading level="h2">Access Your Dashboard</Heading>
            <Text color="muted">
              Enter your email to view your Summer Rising progress
            </Text>
          </div>
        </Card.Header>
        
        <Card.Body>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <Text color="danger" textSize="sm">{error}</Text>
              </div>
            )}
            
            <Button 
              type="submit" 
              intent="primary" 
              className="w-full"
              disabled={!email.trim() || isLoading}
              loading={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Access Dashboard'}
            </Button>
            
            <div className="text-center">
              <Text textSize="xs" color="muted">
                Having trouble? Make sure you&apos;re using your DOE email address.
              </Text>
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
} 