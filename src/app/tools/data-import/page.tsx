'use client';

import React from 'react';
import { Button } from '@/components/core';
import { Card } from '@/components/composed/cards';
import { PageHeader } from '@/components/composed/layouts';
import { 
  BuildingLibraryIcon, 
  PlusCircleIcon,
  UserGroupIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function DataImportPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader title="AI Data Import" />
      <p className="mt-2 text-sm text-gray-600 mb-8">
        Import schools and related data using AI-assisted JSON generation
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Create New School Card */}
        <div 
          className="hover:shadow-lg transition-shadow cursor-pointer" 
          onClick={() => router.push('/tools/data-import/create-school')}
        >
          <Card>
            <Card.Body className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                <BuildingLibraryIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Create New School</h3>
              <p className="text-gray-600 mb-6">
                Start from scratch by creating a new school with basic information. 
                You can add staff, visits, and other data later.
              </p>
              <Button intent="primary" className="w-full">
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                Create School
              </Button>
            </Card.Body>
          </Card>
        </div>

        {/* Add to Existing School Card */}
        <div 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push('/tools/data-import/add-to-school')}
        >
          <Card>
            <Card.Body className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <UserGroupIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Add Data to Existing School</h3>
              <p className="text-gray-600 mb-6">
                Select an existing school and add staff members, visits, or other information 
                using AI assistance.
              </p>
              <Button intent="primary" className="w-full">
                <CalendarDaysIcon className="h-5 w-5 mr-2" />
                Add Data
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
} 