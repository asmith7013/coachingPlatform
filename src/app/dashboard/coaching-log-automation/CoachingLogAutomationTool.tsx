"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
// import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/composed/cards/Card';
import { Table } from '@/components/composed/tables/Table';
import { ReferenceSelect } from '@/components/core/fields/ReferenceSelect';
import { useVisits } from '@/hooks/domain/useVisits';
import { useSchools } from '@/hooks/domain/useSchools';
import { useTeachingLabStaff } from '@/hooks/domain/staff/useTeachingLabStaff';
import { useVisitSchedules } from '@/hooks/domain/schedules/useVisitSchedules';

import { 
  CoachingLogInput,
  createCoachingLogDefaults,
  CoachingLogInputZodSchema 
} from '@zod-schema/visits/coaching-log';
import { automateCoachingLogFillFromSchema } from '@actions/integrations/coaching-log-automation';
import type { TableColumnSchema } from '@ui/table-schema';
import { VisitScheduleBlock } from '@/lib/schema/zod-schema/schedules/schedule-events';

interface FormData {
  schoolName: string;  // Changed from schoolName
  districtName: string;
  coachName: string;
}

export function CoachingLogAutomationTool() {
  const [selectedVisitId, setSelectedVisitId] = useState<string>('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [coachingLogData, setCoachingLogData] = useState<CoachingLogInput>(createCoachingLogDefaults());
  const [formData, setFormData] = useState<FormData>({
    schoolName: '',
    districtName: '',
    coachName: ''
  });
  const [isAutomating, setIsAutomating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  // Add URL parameter handling
  // ✅ FIXED: Follow established pattern - fetch all data with static parameters
  const { items: allVisits = [], isLoading: visitsLoading } = useVisits.list({ limit: 1000 });
  const { items: schools, isLoading: schoolsLoading } = useSchools.list();
  const { items: coaches, isLoading: coachesLoading } = useTeachingLabStaff();

  // ✅ FIXED: Client-side filtering following VisitsStatusGrid pattern
  const visits = useMemo(() => {
    if (!selectedSchoolId) {
      return allVisits.slice(0, 10); // Show first 10 when no school selected
    }
    
    return allVisits
      .filter(visit => visit.schoolId === selectedSchoolId)
      .slice(0, 30); // Show first 30 for selected school
  }, [allVisits, selectedSchoolId]);


  
  // VisitSchedule hook - fetch schedule for selected visit
  const selectedVisit = visits?.find(v => v._id === selectedVisitId);
  const { data: visitSchedule, isLoading: visitScheduleLoading } = useVisitSchedules.byId(
    selectedVisit?.visitScheduleId || '',
    {
      enabled: !!(selectedVisit?.visitScheduleId)
    }
  );

  const handleSchoolSelection = useCallback((value: string | string[]) => {
    const schoolId = Array.isArray(value) ? value[0] || '' : value;
    setSelectedSchoolId(schoolId);
    
    // Clear visit selection when school changes
    if (selectedVisitId) {
      setSelectedVisitId('');
      setFormData({ schoolName: '', districtName: '', coachName: '' });
      setCoachingLogData(createCoachingLogDefaults());
    }
  }, [selectedVisitId]);

  const handleVisitSelection = useCallback(async (visitId: string) => {
    setSelectedVisitId(visitId);
    setResult(null);
    
    if (!visitId) {
      setFormData({ schoolName: '', districtName: '', coachName: '' });
      return;
    }

    // Find the selected visit
    const selectedVisit = visits?.find(visit => visit._id === visitId);
    if (!selectedVisit) return;

    // Initialize coaching log with visit data
    const defaults = createCoachingLogDefaults({
      coachingActionPlanId: selectedVisit.coachingActionPlanId || '',
      visitId: selectedVisit._id
    });
    setCoachingLogData(defaults);

    // Find associated school
    const school = schools?.find(school => school._id === selectedVisit.schoolId);
    
    // Find associated coach  
    const coach = coaches?.find((c) => c._id === selectedVisit.coachId);

    // Update form data with auto-populated values
    setFormData({
      schoolName: school?.schoolNumber || '',
      districtName: school?.district || '',
      coachName: coach?.staffName || ''
    });
  }, [visits, schools, coaches]);
  
  

  // Add useEffect to handle pre-selected visit
  useEffect(() => {
    // Handle pre-selected visit from URL
    // TODO: Re-enable URL parameter handling when needed
    // const searchParams = useSearchParams();
    // const preSelectedVisitId = searchParams.get('visitId');
    
    // if (preSelectedVisitId && visits && visits.length > 0 && !selectedVisitId) {
    //   const visitExists = visits.find(visit => visit._id === preSelectedVisitId);
    //   if (visitExists) {
    //     // Auto-select the school for this visit if not already selected
    //     if (!selectedSchoolId && visitExists.schoolId) {
    //       setSelectedSchoolId(visitExists.schoolId);
    //     }
    //     handleVisitSelection(preSelectedVisitId);
    //   }
    // }
  }, [selectedVisitId, visits, selectedSchoolId, handleVisitSelection]);



  const handleFieldChange = (field: keyof CoachingLogInput, value: string | number | boolean) => {
    setCoachingLogData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFormDataChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAutomate = async () => {
    if (!formData.coachName || !formData.schoolName || !formData.districtName) {
      setResult({
        success: false,
        error: 'Please fill in all required form fields (school number, district name, coach name) before running automation.'
      });
      return;
    }

    setIsAutomating(true);
    setResult(null);
    
    try {
      // Validate schema before sending
      const validatedData = CoachingLogInputZodSchema.parse(coachingLogData);
      
      const automationResult = await automateCoachingLogFillFromSchema(validatedData, {
        schoolName: formData.schoolName,
        districtName: formData.districtName,
        coachName: formData.coachName
      });
      
      setResult(automationResult);
    } catch (error) {
      if (error instanceof Error) {
        setResult({
          success: false,
          error: `Validation error: ${error.message}`
        });
      } else {
        setResult({
          success: false,
          error: 'Unknown validation error'
        });
      }
    } finally {
      setIsAutomating(false);
    }
  };

  // Table configuration for time blocks
  const timeBlockColumns: TableColumnSchema<VisitScheduleBlock>[] = [
    {
      id: 'period',
      label: 'Period',
      accessor: (block) => `${block.periodNumber}${block.periodName ? ` (${block.periodName})` : ''}`,
      width: '15%'
    },
    {
      id: 'time',
      label: 'Time',
      accessor: (block) => `${block.startTime} - ${block.endTime}`,
      width: '20%'
    },
    {
      id: 'eventType',
      label: 'Event Type',
      accessor: (block) => block.eventType,
      width: '15%'
    },
    {
      id: 'portion',
      label: 'Portion',
      accessor: (block) => block.portion,
      width: '15%'
    },
    {
      id: 'staff',
      label: 'Staff Count',
      accessor: (block) => `${block.staffIds.length} teacher${block.staffIds.length !== 1 ? 's' : ''}`,
      align: 'center' as const,
      width: '15%'
    },
    {
      id: 'notes',
      label: 'Notes',
      accessor: (block) => (
        <span className="text-xs text-gray-600 truncate" title={block.notes}>
          {block.notes || 'No notes'}
        </span>
      ),
      width: '20%'
    }
  ];

  // Loading state
  if (schoolsLoading || coachesLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex items-center justify-center p-8">
          <div className="text-lg text-gray-600">Loading schools and staff data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Coaching Log Automation</h1>
        <p className="text-gray-600">
          Schema-driven coaching log form automation with visit auto-population.
        </p>
      </div>

      {/* Visit Selection */}
      <Card className="mb-6">
        <Card.Header>
          <h2 className="text-lg font-semibold">1. Select School and Visit</h2>
          <p className="text-sm text-gray-600 mt-1">First select a school, then choose a visit from that school</p>
        </Card.Header>
        <Card.Body>
          <div className="space-y-4">
            {/* School Selection */}
            <div>
              <ReferenceSelect
                value={selectedSchoolId}
                onChange={handleSchoolSelection}
                label="School"
                url="/api/schools"
                placeholder="Select a school to filter visits..."
                helpText="Choose a school to see visits for that location (max 30 visits)"
              />
            </div>
            
            {/* Visit Selection - only show if school is selected */}
            {selectedSchoolId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visit from Selected School
                </label>
                {visitsLoading ? (
                  <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    Loading visits for selected school...
                  </div>
                ) : visits && visits.length > 0 ? (
                  <select
                    value={selectedVisitId}
                    onChange={(e) => handleVisitSelection(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a visit to auto-populate form data...</option>
                    {visits.map(visit => {
                      const coach = coaches?.find(c => c._id === visit.coachId);
                      const displayText = `${visit.coachingLogSubmitted ? '✅' : '❌'} ${visit.date ? new Date(visit.date).toLocaleDateString() : ''} - ${visit.allowedPurpose || 'Visit'} - ${coach?.staffName || 'Unknown Coach'}`;
                      
                      return (
                        <option key={visit._id} value={visit._id}>
                          {displayText}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <div className="w-full p-3 border border-gray-300 rounded-md bg-yellow-50 text-yellow-800 text-sm">
                    No visits found for the selected school. Try selecting a different school.
                  </div>
                )}
                
                {selectedVisitId && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      ✅ Visit selected - form fields auto-populated below
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Helper text when no school selected */}
            {!selectedSchoolId && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  Select a school above to see available visits for coaching log automation.
                </p>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Form-Specific Information */}
      <Card className="mb-6">
        <Card.Header>
          <h2 className="text-lg font-semibold">2. Form-Specific Information</h2>
          <p className="text-sm text-gray-600 mt-1">Required fields for form automation</p>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => handleFormDataChange('schoolName', e.target.value)}
                placeholder="Enter school name"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.districtName}
                onChange={(e) => handleFormDataChange('districtName', e.target.value)}
                placeholder="Enter district name"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coach Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.coachName}
                onChange={(e) => handleFormDataChange('coachName', e.target.value)}
                placeholder="Enter coach name"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Coaching Log Configuration */}
      <Card className="mb-6">
        <Card.Header>
          <h2 className="text-lg font-semibold">3. Coaching Log Configuration</h2>
          <p className="text-sm text-gray-600 mt-1">Configure coaching log data (optional - defaults will be used)</p>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason Done</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={coachingLogData.reasonDone}
                onChange={(e) => handleFieldChange('reasonDone', e.target.value)}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Duration</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={coachingLogData.totalDuration}
                onChange={(e) => handleFieldChange('totalDuration', e.target.value)}
              >
                <option value="Half day - 3 hours">Half day - 3 hours</option>
                <option value="Full day - 6 hours">Full day - 6 hours</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SOLVES Touchpoint</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={coachingLogData.solvesTouchpoint}
                onChange={(e) => handleFieldChange('solvesTouchpoint', e.target.value)}
              >
                <option value="Teacher support">Teacher support</option>
                <option value="Leader support">Leader support</option>
                <option value="Teacher OR teacher & leader support">Teacher OR teacher & leader support</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Strategy</label>
              <input 
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={coachingLogData.primaryStrategy}
                onChange={(e) => handleFieldChange('primaryStrategy', e.target.value)}
                placeholder="Enter primary strategy"
              />
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Automation Control */}
      <Card className="mb-6">
        <Card.Header>
          <h2 className="text-lg font-semibold">4. Run Automation</h2>
        </Card.Header>
        <Card.Body>
          <div className="flex justify-center">
            <Button
              onClick={handleAutomate}
              disabled={isAutomating || !formData.coachName || !formData.schoolName || !formData.districtName}
              className="px-8 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAutomating ? 'Running Automation...' : 'Run Form Automation'}
            </Button>
          </div>
          
          {result && (
            <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? '✅ ' : '❌ '}
                {result.message || result.error}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Select a visit to auto-populate form data (optional)</li>
              <li>Verify required form fields are correct</li>
              <li>Click &quot;Run Form Automation&quot; to fill the external form</li>
              <li><strong>Review the filled form manually</strong></li>
              <li><strong>Click Submit when ready</strong> - system will auto-close browser and update records</li> 
            </ol>
            {selectedVisitId && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Auto-update enabled:</strong> When you submit, the visit will be marked as completed.
                </p>
              </div>
            )}
            
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="text-xs font-medium text-blue-800 mb-1">🚀 Enhanced Features:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Multi-person events automatically split into separate form rows</li>
                <li>• Smart fallback selection when exact option matches fail</li>
                <li>• Improved error recovery with retry logic</li>
                <li>• Enhanced duration calculation from time blocks</li>
                <li>• Submit button monitoring with automatic visit record updates</li>
              </ul>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Data Preview */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold">Data Preview</h2>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Form Data:</h3>
              <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Coaching Log Schema:</h3>
              <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-32">
                {JSON.stringify(coachingLogData, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Visit Schedule:</h3>
              {selectedVisitId ? (
                visitScheduleLoading ? (
                  <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded border">
                    Loading visit schedule...
                  </div>
                ) : visitSchedule ? (
                  <div className="space-y-3">
                    {/* Schedule Metadata */}
                    <div className="text-xs bg-blue-50 p-3 rounded border">
                      <div><strong>Date:</strong> {visitSchedule.date || 'Not set'}</div>
                      <div><strong>Coach ID:</strong> {visitSchedule.coachId}</div>
                      <div><strong>School ID:</strong> {visitSchedule.schoolId}</div>
                      <div><strong>Events:</strong> {visitSchedule.timeBlocks?.length || 0} time blocks</div>
                    </div>
                    
                    {/* Time Blocks Table */}
                    {visitSchedule.timeBlocks && visitSchedule.timeBlocks.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-2">Time Blocks:</h4>
                        <Table
                          data={visitSchedule.timeBlocks}
                          columns={timeBlockColumns}
                          textSize="xs"
                          padding="xs"
                          className="border rounded"
                          emptyMessage="No time blocks scheduled"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded border">
                    No visit schedule found
                  </div>
                )
              ) : (
                <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded border">
                  Select a visit to view schedule
                </div>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
} 