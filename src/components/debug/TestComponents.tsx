"use client";

import React, { useEffect, useState, useCallback } from 'react';
import useSWR from 'swr';
import { RenderLoopDetector } from './RenderLoopDetector';
import { IsolateComponent } from './IsolateComponent';
import { SWRDebugger } from './SWRDebugger';

// Simple component that only renders once
export function StaticComponent() {
  console.log('StaticComponent render');
  return <div className="p-4 bg-green-100 rounded">This component should render only once</div>;
}

// Component that updates its state once on mount
export function SingleUpdateComponent() {
  const [counter, setCounter] = useState(0);
  
  useEffect(() => {
    // Update state once after mount
    if (counter === 0) {
      setCounter(1);
    }
  }, [counter]);
  
  console.log('SingleUpdateComponent render', counter);
  return (
    <div className="p-4 bg-blue-100 rounded">
      This component should render exactly twice (counter: {counter})
    </div>
  );
}

// Component that uses SWR with a mocked fetcher
export function SimpleSWRComponent() {
  // Mock fetcher that resolves immediately
  const fetcher = useCallback(() => Promise.resolve({ data: 'test' }), []);
  
  // Basic SWR usage
  const { data, error } = useSWR('test-key', fetcher);
  
  console.log('SimpleSWRComponent render', { data, error });
  
  return (
    <div className="p-4 bg-purple-100 rounded">
      SWR Component - Data: {JSON.stringify(data)}
    </div>
  );
}

// Component with unstable props (creates new object each render)
export function UnstablePropsComponent() {
  const [counter, setCounter] = useState(0);
  
  // Force re-render every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCounter(c => c + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Create unstable object on each render
  const unstableObject = { count: counter, timestamp: Date.now() };
  
  console.log('UnstablePropsComponent render', unstableObject);
  
  return (
    <div className="p-4 bg-red-100 rounded">
      Component with unstable props: {JSON.stringify(unstableObject)}
    </div>
  );
}

// Page for testing the components with debug wrappers
export default function TestComponentsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Component Render Debugging</h1>
      
      <div className="space-y-8">
        <IsolateComponent title="Static Component Test">
          <RenderLoopDetector componentId="static">
            <StaticComponent />
          </RenderLoopDetector>
        </IsolateComponent>
        
        <IsolateComponent title="Single Update Component Test">
          <RenderLoopDetector componentId="single-update">
            <SingleUpdateComponent />
          </RenderLoopDetector>
        </IsolateComponent>
        
        <IsolateComponent title="Simple SWR Component Test">
          <SWRDebugger componentId="simple-swr">
            <SimpleSWRComponent />
          </SWRDebugger>
        </IsolateComponent>
        
        <IsolateComponent 
          title="Unstable Props Component Test"
          customSWRConfig={{
            dedupingInterval: 10000,
            revalidateOnFocus: false,
            revalidateIfStale: false,
            revalidateOnReconnect: false,
            shouldRetryOnError: false,
            errorRetryCount: 0,
            keepPreviousData: true,
            provider: () => new Map(),
          }}
        >
          <RenderLoopDetector componentId="unstable-props">
            <UnstablePropsComponent />
          </RenderLoopDetector>
        </IsolateComponent>
      </div>
    </div>
  );
} 