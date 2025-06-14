'use client';

import React, { useState } from 'react';
import { Card } from '@/components/composed/cards/Card';
import { Button } from '@/components/core/Button';
import { Badge } from '@/components/core/feedback/Badge';
import { Select } from '@/components/core/fields/Select';

import {
  CoachingActionPlanV2,
  CoachingActionPlanV2Input,
  createCoachingActionPlanV2Defaults
} from '@zod-schema/cap/coaching-action-plan-v2';
import { useCoachingActionPlans } from '@/hooks/domain';
import { Alert } from '@/components/core/feedback/Alert';

// =====================================
// TYPES AND INTERFACES
// =====================================

interface TestResult {
  operation: string;
  success: boolean;
  data?: unknown;
  error?: string;
}

interface TestState {
  results: TestResult[];
  isLoading: boolean;
  testPlan: CoachingActionPlanV2Input | null;
  selectedPlanId: string | null;
  plans: CoachingActionPlanV2[];
}

// =====================================
// MOCK DATA FACTORY
// =====================================

function generateTestPlan(): CoachingActionPlanV2Input {
  const timestamp = Date.now();
  const basePlan = createCoachingActionPlanV2Defaults({
    userId: 'test-user-id',
    schoolId: '507f1f77bcf86cd799439013',
    teacherId: '507f1f77bcf86cd799439011',
    coachId: '507f1f77bcf86cd799439012',
    academicYear: '2024-2025'
  });
  return {
    ...basePlan,
    title: `Test CAP V2 ${timestamp}`,
    rationale: 'Test rationale using V2 flattened schema',
    goalDescription: 'Test goal description for V2 structure',
    startDate: new Date('2024-02-01').toISOString(),
    endDate: new Date('2024-05-01').toISOString(),
    cycleLength: 3,
    status: 'draft'
  };
}

// =====================================
// MAIN COMPONENT
// =====================================

export default function CoachingActionPlanCRUDTest() {
  // ✅ Use domain hook instead of direct server actions
  const {
    items: plans,
    isLoading: isLoadingList,
    error: listError,
    refetch: refetchPlans
  } = useCoachingActionPlans.list({
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const {
    createAsync,
    updateAsync,
    deleteAsync,
    isCreating,
    isUpdating,
    isDeleting,
    createError,
    updateError,
    deleteError
  } = useCoachingActionPlans.mutations() || {};

  // Only keep local state for results, testPlan, and selectedPlanId
  const [state, setState] = useState<Pick<TestState, 'results' | 'testPlan' | 'selectedPlanId'>>({
    results: [],
    testPlan: null,
    selectedPlanId: null
  });

  // Compute loading state inline
  const isLoading = isLoadingList || isCreating || isUpdating || isDeleting;
  const currentPlans = plans || [];

  // =====================================
  // HELPER FUNCTIONS
  // =====================================

  const addResult = (operation: string, success: boolean, data?: unknown, error?: string) => {
    const result: TestResult = {
      operation,
      success,
      data,
      error
    };
    
    setState(prev => ({
      ...prev,
      results: [result, ...prev.results]
    }));
  };

  // =====================================
  // TEST FUNCTIONS
  // =====================================

  const testCreate = async () => {
    try {
      const testPlan = generateTestPlan();
      setState(prev => ({ ...prev, testPlan }));
      
      const result = await createAsync?.(testPlan as CoachingActionPlanV2);
      
      setState(prev => ({ 
        ...prev,
        selectedPlanId: result?.data?._id || null
      }));
      addResult('CREATE', true, result);
      
      // Refetch to update list
      await refetchPlans();
    } catch (error) {
      addResult('CREATE', false, undefined, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testUpdate = async () => {
    if (!state.selectedPlanId) {
      addResult('UPDATE', false, undefined, 'No plan selected');
      return;
    }
    try {
      const updateData: Partial<CoachingActionPlanV2Input> = {
        title: `Updated Plan V2 ${Date.now()}`,
        status: 'active',
        goalDescription: 'Updated goal description using V2 schema'
      };
      const result = await updateAsync?.(state.selectedPlanId, updateData);
      addResult('UPDATE', true, result);
      refetchPlans();
    } catch (error) {
      addResult('UPDATE', false, undefined, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testDelete = async () => {
    if (!state.selectedPlanId) {
      addResult('DELETE', false, undefined, 'No plan selected');
      return;
    }

    try {
      await deleteAsync?.(state.selectedPlanId);
      
      setState(prev => ({
        ...prev,
        selectedPlanId: null
      }));
      addResult('DELETE', true, { message: 'Plan deleted successfully' });
      
      // Refetch to update list
      refetchPlans();
    } catch (error) {
      addResult('DELETE', false, undefined, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const runAllTests = async () => {
    // Domain hook handles fetching automatically
    await testCreate();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testUpdate();
    await new Promise(resolve => setTimeout(resolve, 500));
    // Note: Not running delete automatically to preserve test data
  };

  const clearResults = () => {
    setState(prev => ({ ...prev, results: [] }));
  };

  // =====================================
  // RENDER
  // =====================================

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <Card.Header>
          <h1 className="text-xl font-semibold">Coaching Action Plan CRUD Test Suite</h1>
        </Card.Header>
        <Card.Body className="space-y-4">
          {/* Control Panel */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={testCreate}
              intent="primary"
              disabled={isLoading}
            >
              {isCreating ? 'Creating...' : 'Test Create'}
            </Button>
            
            <Button 
              onClick={testUpdate}
              intent="secondary"
              disabled={isLoading || !state.selectedPlanId}
            >
              {isUpdating ? 'Updating...' : 'Test Update'}
            </Button>
            
            <Button 
              onClick={testDelete}
              intent="danger"
              disabled={isLoading || !state.selectedPlanId}
            >
              {isDeleting ? 'Deleting...' : 'Test Delete'}
            </Button>
            
            <Button 
              onClick={runAllTests}
              intent="success"
              disabled={isLoading}
            >
              Run All Tests
            </Button>
            
            <Button 
              onClick={clearResults}
              intent="secondary"
            >
              Clear Results
            </Button>
          </div>

          {/* Plan Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Selected Plan for Testing:</label>
            <Select
              value={state.selectedPlanId || ''}
              onChange={(value: string) => setState(prev => ({ 
                ...prev, 
                selectedPlanId: value || null 
              }))}
              options={[
                { value: '', label: 'Select a plan...' },
                ...currentPlans.map(plan => ({
                  value: plan._id,
                  label: `${plan.title} (${plan.status})`
                }))
              ]}
              placeholder="Select a plan..."
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <Alert intent="info">
              Operation in progress...
            </Alert>
          )}

          {/* Error States */}
          {listError && (
            <Alert intent="warning">
              List Error: {listError instanceof Error ? listError.message : 'Unknown error'}
            </Alert>
          )}
          
          {createError && (
            <Alert intent="warning">
              Create Error: {createError instanceof Error ? createError.message : 'Unknown error'}
            </Alert>
          )}
          
          {updateError && (
            <Alert intent="warning">
              Update Error: {updateError instanceof Error ? updateError.message : 'Unknown error'}
            </Alert>
          )}
          
          {deleteError && (
            <Alert intent="warning">
              Delete Error: {deleteError instanceof Error ? deleteError.message : 'Unknown error'}
            </Alert>
          )}

          {/* Current Plans List */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Current Plans ({currentPlans.length})</h3>
            <div className="max-h-40 overflow-y-auto border rounded p-2">
              {currentPlans.length === 0 ? (
                <p className="text-gray-500">No plans found</p>
              ) : (
                <div className="space-y-1">
                  {currentPlans.map((plan) => (
                    <div key={plan._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{plan.title}</span>
                        <Badge intent="neutral" className="ml-2">{plan.status}</Badge>
                        <Badge intent="info" className="ml-1">{plan.academicYear}</Badge>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>{plan.ipgCoreAction} - {plan.ipgSubCategory}</div>
                        <div>Cycles: {plan.cycleLength}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Test Plan Preview */}
          {state.testPlan && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Last Generated Test Plan (V2 Schema)</h3>
              <div className="max-h-60 overflow-y-auto border rounded p-2">
                <div className="space-y-2 text-sm">
                  <div><strong>Title:</strong> {state.testPlan.title}</div>
                  <div><strong>Goal:</strong> {state.testPlan.goalDescription}</div>
                  <div><strong>IPG Focus:</strong> {state.testPlan.ipgCoreAction} - {state.testPlan.ipgSubCategory}</div>
                  <div><strong>Academic Year:</strong> {state.testPlan.academicYear}</div>
                  <div><strong>Cycle Length:</strong> {state.testPlan.cycleLength}</div>
                  <div><strong>Status:</strong> {state.testPlan.status}</div>
                  <div><strong>Start Date:</strong> {state.testPlan.startDate}</div>
                  <div><strong>Rationale:</strong> {state.testPlan.rationale}</div>
                </div>
              </div>
            </div>
          )}

          {/* Test Results */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Test Results ({state.results.length})</h3>
            <div className="max-h-80 overflow-y-auto border rounded p-2">
              {state.results.length === 0 ? (
                <p className="text-gray-500">No test results yet</p>
              ) : (
                <div className="space-y-2">
                  {state.results.map((result, index) => (
                    <div key={index} className="border rounded p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{result.operation}</span>
                        <Badge intent={result.success ? "success" : "danger"}>
                          {result.success ? 'SUCCESS' : 'FAILED'}
                        </Badge>
                      </div>
                      
                      {result.error && (
                        <div className="mt-2 text-red-600 text-sm">
                          Error: {result.error}
                        </div>
                      )}
                      
                      {/* {result.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-gray-600">
                            View Data
                          </summary>
                          <pre className="mt-1 text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )} */}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800">Updated Infrastructure Used:</h4>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li>✅ CoachingActionPlanV2 Schema (flattened structure)</li>
              <li>✅ Domain hooks with CRUD factory pattern</li>
              <li>✅ Server actions with CRUD factory</li>
              <li>✅ Proper error handling with domain hooks</li>
              <li>✅ Automatic cache management</li>
              <li>✅ Type-safe operations</li>
            </ul>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
