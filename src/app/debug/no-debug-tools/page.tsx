"use client";

import React from 'react';

/**
 * Extremely minimal component with no hooks at all
 */
const PureComponent = () => {
  return <div className="p-4 bg-white">Pure static content with no hooks or state</div>;
};

/**
 * Component with just useState
 */
const StateComponent = () => {
  const [count, setCount] = React.useState(0);
  
  return (
    <div className="p-4 bg-white mt-4">
      <p>Component with just useState: {count}</p>
      <button 
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
        onClick={() => setCount(c => c + 1)}
      >
        Increment
      </button>
    </div>
  );
};

/**
 * Component with useEffect but no state updates
 */
const EffectComponent = () => {
  const renderCount = React.useRef(0);
  
  React.useEffect(() => {
    renderCount.current += 1;
    console.log(`EffectComponent rendered ${renderCount.current} times`);
    
    // No state updates here
  }, []);
  
  return (
    <div className="p-4 bg-white mt-4">
      <p>Component with useEffect (check console)</p>
    </div>
  );
};

/**
 * Main page with no debug tools at all
 */
export default function NoDebugTools() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">No Debug Tools Test</h1>
      <p className="mb-6 text-gray-600">
        This page has no debugging tools, performance monitoring, or SWR to check if they&apos;re causing the render loop
      </p>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Pure Component</h2>
          <PureComponent />
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">State Component</h2>
          <StateComponent />
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Effect Component</h2>
          <EffectComponent />
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 rounded">
        <h3 className="font-semibold">Manual Testing Instructions:</h3>
        <ol className="list-decimal pl-5 mt-2 space-y-1">
          <li>Open browser dev tools console</li>
          <li>Check if EffectComponent logs more than once</li>
          <li>Click the increment button and check if it works normally</li>
          <li>Look for any warnings or errors in the console</li>
        </ol>
      </div>
    </div>
  );
} 