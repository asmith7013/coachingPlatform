"use client";

import React, { useState } from "react";
import { ReferenceSelect } from "@/components/core/fields/ReferenceSelect";
import { useReferenceData, getEntityTypeFromUrlUtil } from "@/query/client/hooks/queries/useReferenceData";

export function ReferenceDebugger() {
  // Debug state
  const [url, setUrl] = useState("/api/schools");
  const [search, setSearch] = useState("");
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [multiValue, setMultiValue] = useState<string[]>([]);
  const [isMulti, setIsMulti] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  
  // Entity type info
  const entityType = getEntityTypeFromUrlUtil(url);
  
  // Use the hook directly
  const { options, isLoading, error } = useReferenceData({
    url,
    search,
    entityType,
  });
  
  // Log state changes in debug mode
  React.useEffect(() => {
    if (debugMode) {
      console.log("[Debug] Selected value:", isMulti ? multiValue : selectedValue);
      console.log("[Debug] Options:", options);
    }
  }, [debugMode, selectedValue, multiValue, options, isMulti]);
  
  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Reference System Debugger</h1>
      
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">API URL</label>
            <input 
              type="text"
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              placeholder="/api/schools"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Entity Type: {entityType}
            </p>
          </div>
          
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700">Search</label>
            <input 
              type="text"
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div className="flex items-end mb-1">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isMulti}
                onChange={(e) => setIsMulti(e.target.checked)}
                className="h-4 w-4"
              />
              <span>Multi-select</span>
            </label>
          </div>
          
          <div className="flex items-end mb-1">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={debugMode}
                onChange={(e) => setDebugMode(e.target.checked)}
                className="h-4 w-4"
              />
              <span>Debug Mode</span>
            </label>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Reference Select Component</h3>
          <div className="space-y-4">
            <ReferenceSelect
              label="Reference Selection"
              url={url}
              value={isMulti ? multiValue : selectedValue}
              onChange={(value) => isMulti 
                ? setMultiValue(Array.isArray(value) ? value : []) 
                : setSelectedValue(typeof value === 'string' ? value : '')
              }
              multiple={isMulti}
              search={search}
              helpText={`Selected: ${isMulti 
                ? multiValue.join(', ') 
                : selectedValue
              }`}
            />
            
            <div>
              <button 
                onClick={() => isMulti ? setMultiValue([]) : setSelectedValue('')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
        
        {debugMode && (
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Debug Information</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Status</h4>
                <div className="text-sm">
                  Loading: {isLoading ? 'Yes' : 'No'}<br />
                  Error: {error ? error.message : 'None'}<br />
                  Options Count: {options?.length || 0}<br />
                </div>
              </div>
              
              <div>
                <h4 className="font-medium">Options (First 5)</h4>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(options?.slice(0, 5), null, 2)}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium">Selected Value</h4>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(isMulti ? multiValue : selectedValue, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 