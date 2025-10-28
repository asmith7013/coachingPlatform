"use client";

import React, { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/fields/Input';
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
    email: 'alex.smith@teachinglab.org',
    password: 'rbx1KQD3fpv7qhd!erc'
  });
  
  const [skillNumbersInput, setSkillNumbersInput] = useState('');
  const [delay, setDelay] = useState(2000);

  // Parse skill numbers from textarea input
  const parseSkillNumbers = (input: string): string[] => {
    return input
      .split('\n')
      .map(line => line.trim())
      .map(line => {
        // Extract just numbers from each line
        const match = line.match(/\d+/);
        return match ? match[0] : '';
      })
      .filter(num => num.length > 0)
      .filter((num, index, self) => self.indexOf(num) === index); // Remove duplicates
  };

  const skillNumbers = parseSkillNumbers(skillNumbersInput);

  const handleRemoveSkill = (skillNumber: string) => {
    const lines = skillNumbersInput.split('\n');
    const updatedLines = lines.filter(line => {
      const match = line.match(/\d+/);
      return match ? match[0] !== skillNumber : true;
    });
    setSkillNumbersInput(updatedLines.join('\n'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (skillNumbers.length === 0) {
      return;
    }

    const urls = skillNumbers.map(num => `https://roadmaps.teachtoone.org/skill/${num}`);
    onSubmit(credentials, urls, delay);
  };

  const handleDebugSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (skillNumbers.length === 0) {
      return;
    }

    const urls = skillNumbers.slice(0, 2).map(num => `https://roadmaps.teachtoone.org/skill/${num}`);
    onDebugSubmit(credentials, urls, Math.max(delay, 3000));
  };

  const handleValidateCredentials = () => {
    if (credentials.email && credentials.password) {
      onValidateCredentials(credentials);
    }
  };

  const isFormValid = credentials.email && credentials.password && skillNumbers.length > 0;
  
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
        
        {/* Skill Numbers Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Skill Numbers</h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill Numbers (one per line)
            </label>
            <textarea
              value={skillNumbersInput}
              onChange={(e) => setSkillNumbersInput(e.target.value)}
              placeholder="660
661
662
114
115"
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
            <p className="text-sm text-gray-500">
              Paste skill numbers, one per line. Numbers will be automatically extracted.
            </p>
          </div>

          <div className="text-sm text-gray-600">
            Skills found: {skillNumbers.length}
          </div>

          {/* Skill Numbers List */}
          {skillNumbers.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Skills to Scrape:</h4>
              <div className="flex flex-wrap gap-2">
                {skillNumbers.map((skillNumber) => (
                  <div
                    key={skillNumber}
                    className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    <span>Skill {skillNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skillNumber)}
                      className="text-blue-600 hover:text-blue-800 font-bold"
                      aria-label={`Remove skill ${skillNumber}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            {isLoading ? 'Scraping...' : `Scrape Skills (${skillNumbers.length})`}
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
          <li>• Paste skill numbers in the textarea, one per line</li>
          <li>• Numbers will be automatically extracted from each line</li>
          <li>• Use &quot;Test Credentials&quot; to verify login before scraping</li>
          <li>• Use &quot;Debug Mode&quot; to test with first 2 skills and visible browser</li>
          <li>• Results will be displayed below and can be exported as JSON</li>
        </ul>
      </div>
    </div>
  );
}
