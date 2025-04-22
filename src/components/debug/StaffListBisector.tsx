"use client";

import React, { useState } from 'react';
import { StaffListDebugger } from './StaffListDebugger';
import type { NYCPSStaff } from '@/lib/data/schemas/core/staff';

// Use Partial type for mock data to avoid having to provide all required fields
const MOCK_STAFF: Partial<NYCPSStaff>[] = [
  { 
    _id: '1', 
    staffName: 'Test Teacher 1', 
    email: 'teacher1@example.com',
    schools: ['school1'],
    rolesNYCPS: ['Teacher']
  },
  { 
    _id: '2', 
    staffName: 'Test Teacher 2', 
    email: 'teacher2@example.com',
    schools: ['school1'],
    rolesNYCPS: ['Teacher']
  }
];

// Mock hook for potential future use
function _useStableStaffData() {
  return {
    staff: MOCK_STAFF,
    total: MOCK_STAFF.length,
    loading: false,
    error: null,
    page: 1,
    setPage: () => console.log('setPage called'),
    limit: 10,
    applyFilters: () => console.log('applyFilters called'),
    changeSorting: () => console.log('changeSorting called'),
    removeStaff: () => console.log('removeStaff called')
  };
}

// Create versions of components without any state/effects for baseline testing
const StaticSearchBar = () => (
  <div className="p-3 bg-gray-100 rounded mb-4">
    <input type="text" placeholder="Search" className="p-2 border rounded" disabled />
  </div>
);

const StaticStaffCard = ({ staff }: { staff: Partial<NYCPSStaff> }) => (
  <div className="p-4 mb-2 border rounded bg-white">
    <h3>{staff.staffName}</h3>
    <p>{staff.email}</p>
  </div>
);

const StaticStaffList = () => (
  <div>
    {MOCK_STAFF.map(staff => (
      <StaticStaffCard key={staff._id} staff={staff} />
    ))}
  </div>
);

const StaticForm = () => (
  <div className="p-4 mt-4 border rounded bg-gray-50">
    <h3 className="font-bold mb-2">Add Staff Form (Static)</h3>
    <input 
      type="text" 
      placeholder="Name" 
      className="p-2 border rounded w-full mb-2" 
      disabled 
    />
    <button 
      className="p-2 bg-blue-500 text-white rounded" 
      disabled
    >
      Add
    </button>
  </div>
);

// Align this type with the one in StaffListDebugger
type BisectionMode = 'full' | 'no-search' | 'no-list' | 'no-form' | 'minimal';

/**
 * Bisector component that isolates different parts of the StaffList 
 * to help identify which part causes the render loop
 */
export function StaffListBisector() {
  // Map our UI modes to the debug component's modes
  const [uiMode, setUiMode] = useState<'full' | 'search' | 'list' | 'form' | 'minimal'>('full');
  
  // Convert UI mode to bisection mode
  const getBisectionMode = (mode: typeof uiMode): BisectionMode => {
    switch (mode) {
      case 'search': return 'no-list';
      case 'list': return 'no-search';
      case 'form': return 'no-form';
      case 'minimal': return 'minimal';
      case 'full': return 'full';
      default: return 'full';
    }
  };
  
  // Render different simplified versions based on mode
  const content = (() => {
    switch (uiMode) {
      case 'search':
        return <StaticSearchBar />;
      case 'list':
        return <StaticStaffList />;
      case 'form':
        return <StaticForm />;
      case 'minimal':
        return <div className="p-4 bg-white rounded">Minimal test component</div>;
      case 'full':
      default:
        return (
          <>
            <StaticSearchBar />
            <StaticStaffList />
            <StaticForm />
          </>
        );
    }
  })();

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-wrap gap-2">
        <button 
          onClick={() => setUiMode('full')}
          className={`px-3 py-1 rounded ${uiMode === 'full' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Full Component
        </button>
        <button 
          onClick={() => setUiMode('search')}
          className={`px-3 py-1 rounded ${uiMode === 'search' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Search Only
        </button>
        <button 
          onClick={() => setUiMode('list')}
          className={`px-3 py-1 rounded ${uiMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          List Only
        </button>
        <button 
          onClick={() => setUiMode('form')}
          className={`px-3 py-1 rounded ${uiMode === 'form' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Form Only
        </button>
        <button 
          onClick={() => setUiMode('minimal')}
          className={`px-3 py-1 rounded ${uiMode === 'minimal' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Minimal
        </button>
      </div>
      
      <StaffListDebugger mode={getBisectionMode(uiMode)}>
        {content}
      </StaffListDebugger>
    </div>
  );
} 