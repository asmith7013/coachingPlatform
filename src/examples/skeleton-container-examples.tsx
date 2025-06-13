'use client';

import React, { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/composed/cards';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { SkeletonContainer } from '@/components/composed/feedback/SkeletonContainer';
import { SkeletonCard, TableSkeleton } from '@/components/composed/feedback/SkeletonCard';
import { ObservationListSkeleton } from '@/components/domain/observations/ObservationListSkeleton';

/**
 * Examples showing the clean SkeletonContainer pattern
 * Each component focuses ONLY on its core responsibility
 * All loading states are handled by the container
 */
export default function SkeletonContainerExamples() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  const toggleError = () => {
    setError(error ? null : 'Something went wrong!');
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-8">
        
        {/* Header */}
        <div>
          <Heading level="h1" className="mb-2">
            ✨ SkeletonContainer Pattern Examples
          </Heading>
          <Text color="muted">
            Clean separation of concerns - components focus on content, container handles loading
          </Text>
        </div>

        {/* Demo Controls */}
        <Card>
          <Card.Header>
            <Heading level="h2">Demo Controls</Heading>
          </Card.Header>
          <Card.Body>
            <div className="flex gap-4">
              <Button onClick={toggleLoading} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Demo Loading State (3s)'}
              </Button>
              <Button onClick={toggleError}>
                {error ? 'Clear Error' : 'Demo Error State'}
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Example 1: Staff List */}
        <Card>
          <Card.Header>
            <Heading level="h2">Example 1: Staff List Component</Heading>
            <Text color="muted">Clean component with SkeletonContainer wrapper</Text>
          </Card.Header>
          <Card.Body>
            <SkeletonContainer
              isLoading={isLoading}
              error={error}
              skeleton={
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }, (_, i) => (
                    <SkeletonCard key={i} showHeader={false} lines={2} actionCount={1} />
                  ))}
                </div>
              }
              errorComponent={
                <div className="text-center py-8">
                  <Text color="danger">Failed to load staff members</Text>
                </div>
              }
            >
              {/* Clean component - no loading logic needed */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }, (_, i) => (
                  <Card key={i}>
                    <Card.Body>
                      <Text className="font-medium">Staff Member {i + 1}</Text>
                      <Text textSize="sm" color="muted">Role: Teacher</Text>
                      <Button appearance="outline" className="mt-2">View</Button>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </SkeletonContainer>
          </Card.Body>
        </Card>

        {/* Example 2: Data Table */}
        <Card>
          <Card.Header>
            <Heading level="h2">Example 2: Data Table Component</Heading>
            <Text color="muted">Table with skeleton loading</Text>
          </Card.Header>
          <Card.Body>
            <SkeletonContainer
              isLoading={isLoading}
              error={error}
              skeleton={<TableSkeleton rows={5} columns={4} showHeader={true} />}
            >
              {/* Clean table component */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b">
                  <div className="grid grid-cols-4 gap-4 font-medium">
                    <span>Name</span>
                    <span>Role</span>
                    <span>School</span>
                    <span>Status</span>
                  </div>
                </div>
                <div className="divide-y">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="px-6 py-4">
                      <div className="grid grid-cols-4 gap-4">
                        <span>Teacher {i + 1}</span>
                        <span>Mathematics</span>
                        <span>Central High</span>
                        <span className="text-green-600">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SkeletonContainer>
          </Card.Body>
        </Card>

        {/* Example 3: Your Original Observation List */}
        <Card>
          <Card.Header>
            <Heading level="h2">Example 3: Observation List (Your Discovery!)</Heading>
            <Text color="muted">This uses your original beautiful shimmer effect</Text>
          </Card.Header>
          <Card.Body>
            <SkeletonContainer
              isLoading={isLoading}
              error={error}
              skeleton={<ObservationListSkeleton count={3} />}
            >
              {/* Clean observation list */}
              <Card>
                <Card.Header>
                  <Heading level="h3">Classroom Observations</Heading>
                  <Text textSize="sm" color="muted">3 observations</Text>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-4">
                    {Array.from({ length: 3 }, (_, i) => (
                      <Card key={i} className="border">
                        <Card.Body>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <Heading level="h4" className="mb-2">
                                Cycle {i + 1} - Session A
                              </Heading>
                              <Text textSize="sm" color="muted">Date: March {10 + i}, 2024</Text>
                              <Text textSize="sm" color="muted">Status: Completed</Text>
                            </div>
                            <div className="flex gap-2">
                              <Button appearance="outline">View</Button>
                              <Button appearance="outline">Edit</Button>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </SkeletonContainer>
          </Card.Body>
        </Card>

        {/* Usage Code Examples */}
        <Card>
          <Card.Header>
            <Heading level="h2">Usage Pattern</Heading>
          </Card.Header>
          <Card.Body>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Text className="mb-4 font-medium">Before (Complex):</Text>
              <pre className="text-sm overflow-x-auto mb-6 bg-red-50 p-3 rounded border">
{`// ❌ Complex - loading logic mixed with component logic
function MyComponent({ isLoading, error, data }) {
  const showSkeleton = useSimpleSkeletonLoading(isLoading, 150);
  
  if (error) return <ErrorComponent />;
  if (showSkeleton) return <ComplexSkeletonJSX />;
  
  return <ActualComponent data={data} />;
}`}
              </pre>
              
              <Text className="mb-4 font-medium">After (Clean):</Text>
              <pre className="text-sm overflow-x-auto bg-green-50 p-3 rounded border">
{`// ✅ Clean - component focuses on its responsibility  
function MyComponent({ isLoading, error, data }) {
  return (
    <SkeletonContainer
      isLoading={isLoading}
      error={error}
      skeleton={<MySkeleton />}
    >
      <ActualComponent data={data} />
    </SkeletonContainer>
  );
}`}
              </pre>
            </div>
          </Card.Body>
        </Card>

        {/* Benefits */}
        <Card>
          <Card.Header>
            <Heading level="h2">Benefits of SkeletonContainer Pattern</Heading>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Text className="font-medium mb-2 text-green-600">✅ What You Get</Text>
                <ul className="space-y-1 text-sm">
                  <li>• Clean separation of concerns</li>
                  <li>• Zero code duplication</li>
                  <li>• Single pattern for all loading states</li>
                  <li>• Easy to test and maintain</li>
                  <li>• Components focus on their purpose</li>
                </ul>
              </div>
              <div>
                <Text className="font-medium mb-2 text-red-600">❌ What You Avoid</Text>
                <ul className="space-y-1 text-sm">
                  <li>• Complex wrapper components</li>
                  <li>• Scattered loading logic</li>
                  <li>• *WithSkeleton component variants</li>
                  <li>• Mixed responsibilities</li>
                  <li>• Hard-to-maintain code</li>
                </ul>
              </div>
            </div>
          </Card.Body>
        </Card>

      </div>
    </div>
  );
} 