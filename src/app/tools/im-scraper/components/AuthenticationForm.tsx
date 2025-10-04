"use client";

import React, { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/fields/Input';
import { Alert } from '@/components/core/feedback/Alert';
import { SimpleCard } from '@/components/core/cards/SimpleCard';
import { IMCredentials } from '../lib/types';

interface AuthenticationFormProps {
  onCredentialsSubmit: (credentials: IMCredentials) => Promise<void>;
  isValidating: boolean;
  credentialsValid: boolean | null;
  error?: string | null;
}

export function AuthenticationForm({
  onCredentialsSubmit,
  isValidating,
  credentialsValid,
  error
}: AuthenticationFormProps) {
  const [credentials, setCredentials] = useState<IMCredentials>({
    email: 'alex.smith@teachinglab.org',
    password: 'rFw&Yn3%7w2Dc502'
  });
  
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};
    
    if (!credentials.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!credentials.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    await onCredentialsSubmit(credentials);
  };

  const handleInputChange = (field: keyof IMCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <div className="mb-6">
      <SimpleCard
        initials="IM"
        title="IM Platform Authentication"
        subtitle="Enter your credentials to access the IM curriculum platform"
        colorVariant="primary"
        size="lg"
      />
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 -mt-1">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="email"
              label="Email"
              type="email"
              value={credentials.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={formErrors.email}
              placeholder="your.email@teachinglab.org"
              required
              disabled={isValidating}
            />
            
            <Input
              id="password"
              label="Password"
              type="password"
              value={credentials.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={formErrors.password}
              placeholder="Enter your password"
              required
              disabled={isValidating}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              loading={isValidating}
              disabled={isValidating}
              intent="primary"
            >
              {isValidating ? 'Validating...' : 'Validate Credentials'}
            </Button>
          </div>
        </form>

        {/* Status Messages */}
        <div className="mt-4 space-y-3">
          {error && (
            <Alert intent="error">
              <Alert.Title>Authentication Error</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert>
          )}
          
          {credentialsValid === true && (
            <Alert intent="success">
              <Alert.Title>Authentication Successful</Alert.Title>
              <Alert.Description>
                Your credentials are valid. You can now proceed with scraping.
              </Alert.Description>
            </Alert>
          )}
          
          {credentialsValid === false && !error && (
            <Alert intent="warning">
              <Alert.Title>Authentication Failed</Alert.Title>
              <Alert.Description>
                Please check your credentials and try again.
              </Alert.Description>
            </Alert>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Instructions:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Use your Teaching Lab email address</li>
            <li>• Enter the same password you use for the IM curriculum platform</li>
            <li>• Credentials are validated before scraping begins</li>
            <li>• Your credentials are not stored permanently</li>
          </ul>
        </div>
      </div>
    </div>
  );
}