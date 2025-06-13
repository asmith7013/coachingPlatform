'use client';

import React, { useState } from 'react';
import { ReferenceSelect } from '@/components/core/fields/ReferenceSelect';
import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Button } from '@/components/core/Button';

export default function DebugReferenceSelect() {
  const [value, setValue] = useState<string[]>([]);
  const [singleValue, setSingleValue] = useState<string>('');
  const [renderCount, setRenderCount] = useState(0);
  
  // Force re-render the page
  const forceUpdate = () => {
    setRenderCount(prev => prev + 1);
  };

  // Clear all selections
  const clearSelections = () => {
    setValue([]);
    setSingleValue('');
  };
  
  // Log current state
  const logState = () => {
    console.log('Current state:', {
      value,
      singleValue,
      renderCount
    });
  };

  // Handle multiple select change
  const handleMultipleChange = (value: string | string[]) => {
    if (Array.isArray(value)) {
      setValue(value);
    } else {
      setValue([value]);
    }
  };

  // Handle single select change
  const handleSingleChange = (value: string | string[]) => {
    if (Array.isArray(value)) {
      setSingleValue(value[0] || '');
    } else {
      setSingleValue(value);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Heading level="h1" className="mb-6">Debug Reference Select</Heading>
      <Text className="mb-8">
        This page allows you to test and debug the ReferenceSelect component.
        The component has been simplified and now integrates with TanStack Form through useFieldRenderer.
        Open your browser console to see detailed debug information.
      </Text>
      
      <div className="flex space-x-4 mb-8">
        <Button onClick={forceUpdate}>Force Re-render ({renderCount})</Button>
        <Button onClick={clearSelections}>Clear Selections</Button>
        <Button onClick={logState}>Log Current State</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <Heading level="h2" className="mb-4">Multiple Select</Heading>
          <ReferenceSelect
            label="Schools"
            url="/api/reference/schools"
            value={value}
            onChange={handleMultipleChange}
            multiple={true}
            helpText="Select multiple schools to test the component"
          />
          
          <div className="mt-4">
            <Text className="font-semibold">Selected Values:</Text>
            <pre className="text-xs p-4 bg-gray-100 rounded overflow-auto mt-2">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        </Card>
        
        <Card className="p-4">
          <Heading level="h2" className="mb-4">Single Select</Heading>
          <ReferenceSelect
            label="School"
            url="/api/reference/schools"
            value={singleValue}
            onChange={handleSingleChange}
            multiple={false}
            helpText="Select a single school to test the component"
          />
          
          <div className="mt-4">
            <Text className="font-semibold">Selected Value:</Text>
            <pre className="text-xs p-4 bg-gray-100 rounded overflow-auto mt-2">
              {JSON.stringify(singleValue, null, 2)}
            </pre>
          </div>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card className="p-4">
          <Heading level="h3" className="mb-4">Debug Information</Heading>
          <Text className="mb-2">Render Count: {renderCount}</Text>
          <Text className="mb-2">Multiple Select Items: {value.length}</Text>
          <Text className="mb-2">Single Select Value: {singleValue || "<none>"}</Text>
          <Text className="mb-2">Integration: ReferenceSelect now works through useFieldRenderer</Text>
        </Card>
      </div>
    </div>
  );
} 