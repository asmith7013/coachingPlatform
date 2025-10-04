"use client";

import React, { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/fields/Input';
import { Textarea } from '@/components/core/fields/Textarea';
import { Alert } from '@/components/core/feedback/Alert';
import { RoadmapsCredentials } from '../lib/types';

interface RoadmapsScraperFormProps {
  onSubmit: (credentials: RoadmapsCredentials, urls: string[], delay: number) => void;
  onDebugSubmit: (credentials: RoadmapsCredentials, urls: string[], delay: number) => void;
  onValidateCredentials: (credentials: RoadmapsCredentials) => void;
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;
}

export function RoadmapsScraperForm({
  onSubmit,
  onDebugSubmit,
  onValidateCredentials,
  isLoading,
  isValidating,
  error
}: RoadmapsScraperFormProps) {
  const [credentials, setCredentials] = useState<RoadmapsCredentials>({
    email: 'demoaccount+lily.carter@teachtoone.org',
    password: 'Fraction@75'
  });
  
  const [urlsText, setUrlsText] = useState('');
  const [delay, setDelay] = useState(2000);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const urls = urlsText
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    if (urls.length === 0) {
      return;
    }
    
    if (urls.length > 12) {
      return;
    }
    
    onSubmit(credentials, urls, delay);
  };
  
  const handleDebugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const urls = urlsText
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    if (urls.length === 0) {
      return;
    }
    
    onDebugSubmit(credentials, urls.slice(0, 2), Math.max(delay, 3000));
  };
  
  const handleValidateCredentials = () => {
    if (credentials.email && credentials.password) {
      onValidateCredentials(credentials);
    }
  };
  
  const urls = urlsText
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0);
  
  const isFormValid = credentials.email && credentials.password && urls.length > 0 && urls.length <= 12;
  
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Teach to One Roadmaps Skill Scraper
        </h2>
        <p className="text-sm text-gray-600">
          Extract educational skill content from Teach to One Roadmaps platform
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Credentials Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Authentication</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              placeholder="your.email@example.com"
              required
            />
            
            <Input
              label="Password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <Button
            type="button"
            onClick={handleValidateCredentials}
            disabled={!credentials.email || !credentials.password || isValidating}
            intent="secondary"
            appearance="outline"
            padding="sm"
          >
            {isValidating ? 'Validating...' : 'Test Credentials'}
          </Button>
        </div>
        
        {/* URLs Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Skill URLs</h3>
          
          <Textarea
            label="Skill URLs (one per line, max 12)"
            value={urlsText}
            onChange={(e) => setUrlsText(e.target.value)}
            placeholder={`https://roadmaps.teachtoone.org/skill/660
https://roadmaps.teachtoone.org/skill/661
https://roadmaps.teachtoone.org/skill/662`}
            rows={8}
            required
          />
          
          <div className="text-sm text-gray-600">
            URLs found: {urls.length} / 12 max
            {urls.length > 12 && (
              <span className="text-red-600 ml-2">Too many URLs! Maximum 12 allowed.</span>
            )}
          </div>
        </div>
        
        {/* Settings Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Settings</h3>
          
          <Input
            label="Delay Between Requests (ms)"
            type="number"
            value={delay}
            onChange={(e) => setDelay(parseInt(e.target.value) || 2000)}
            min={1000}
            max={10000}
            step={500}
            helpText="Recommended: 2000ms to be respectful to the server"
          />
        </div>
        
        {/* Error Display */}
        {error && (
          <Alert intent="error">
            <Alert.Title>Scraping Error</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            intent="primary"
            fullWidth={false}
          >
            {isLoading ? 'Scraping...' : `Scrape Skills (${urls.length})`}
          </Button>
          
          <Button
            type="button"
            onClick={handleDebugSubmit}
            disabled={!isFormValid || isLoading}
            intent="secondary"
            appearance="outline"
            fullWidth={false}
          >
            Debug Mode (2 URLs)
          </Button>
        </div>
      </form>
      
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Enter your Teach to One Roadmaps login credentials</li>
          <li>• Paste skill URLs (one per line, maximum 12)</li>
          <li>• Use &quot;Test Credentials&quot; to verify login before scraping</li>
          <li>• Use &quot;Debug Mode&quot; to test with 2 URLs and visible browser</li>
          <li>• Results will be displayed below and can be exported as JSON</li>
        </ul>
      </div>
    </div>
  );
}
