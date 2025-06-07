'use client'

import { useState } from 'react'
import { PurposeAssignmentDropdown, type EventPurpose, getRecommendedPurpose } from '@/components/features/scheduleBuilder/PurposeAssignmentDropdown'
import { PageHeader } from '@/components/composed/layouts/PageHeader'

export default function PurposeDropdownDemo() {
  const [selectedPurpose1, setSelectedPurpose1] = useState<EventPurpose | null>(null)
  const [selectedPurpose2, setSelectedPurpose2] = useState<EventPurpose | null>('Observation')
  const [selectedPurpose3, setSelectedPurpose3] = useState<EventPurpose | null>(null)
  const [selectedPurpose4, setSelectedPurpose4] = useState<EventPurpose | null>(null)

  // Mock teacher schedule context
  const mockTeacherContext = {
    isTeaching: true,
    isPrepPeriod: false,
    subject: 'Mathematics',
    period: 3
  }

  const recommendedPurpose = getRecommendedPurpose(
    mockTeacherContext.isTeaching, 
    mockTeacherContext.isPrepPeriod
  )

  const handleRemove1 = () => {
    setSelectedPurpose1(null)
    console.log('Assignment 1 removed')
  }

  const handleRemove2 = () => {
    setSelectedPurpose2(null)
    console.log('Assignment 2 removed')
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <PageHeader
        title="Purpose Assignment Dropdown Demo"
        subtitle="Testing the PurposeAssignmentDropdown component with different states and contexts"
      />

      {/* Context Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Mock Teacher Context</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Subject:</strong> {mockTeacherContext.subject}</p>
          <p><strong>Period:</strong> {mockTeacherContext.period}</p>
          <p><strong>Is Teaching:</strong> {mockTeacherContext.isTeaching ? 'Yes' : 'No'}</p>
          <p><strong>Is Prep Period:</strong> {mockTeacherContext.isPrepPeriod ? 'Yes' : 'No'}</p>
          <p><strong>Recommended Purpose:</strong> <span className="font-semibold">{recommendedPurpose}</span></p>
        </div>
      </div>

      {/* Demo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Example 1: Default State */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Default State</h3>
          <p className="text-sm text-gray-600 mb-4">
            No selection with auto-recommendation based on teaching schedule
          </p>
          <PurposeAssignmentDropdown
            value={selectedPurpose1}
            onChange={setSelectedPurpose1}
            onRemove={handleRemove1}
            recommendedPurpose={recommendedPurpose}
            placeholder="Select event purpose"
            aria-label="Event purpose selection"
          />
          {selectedPurpose1 && (
            <p className="text-sm text-green-600 mt-2">
              Selected: <strong>{selectedPurpose1}</strong>
            </p>
          )}
        </div>

        {/* Example 2: With Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">With Selection</h3>
          <p className="text-sm text-gray-600 mb-4">
            Pre-selected with remove button functionality
          </p>
          <PurposeAssignmentDropdown
            value={selectedPurpose2}
            onChange={setSelectedPurpose2}
            onRemove={handleRemove2}
            recommendedPurpose={recommendedPurpose}
            showRemoveButton={true}
          />
          {selectedPurpose2 && (
            <p className="text-sm text-green-600 mt-2">
              Selected: <strong>{selectedPurpose2}</strong>
            </p>
          )}
        </div>

        {/* Example 3: Small Size */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Small Size</h3>
          <p className="text-sm text-gray-600 mb-4">
            Compact version for use in tight layouts
          </p>
          <PurposeAssignmentDropdown
            value={selectedPurpose3}
            onChange={setSelectedPurpose3}
            size="sm"
            recommendedPurpose="Pre-Brief"
            placeholder="Select purpose"
            showRemoveButton={false}
          />
        </div>

        {/* Example 4: Error State */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Error State</h3>
          <p className="text-sm text-gray-600 mb-4">
            Validation error with custom error styling
          </p>
          <PurposeAssignmentDropdown
            value={selectedPurpose4}
            onChange={setSelectedPurpose4}
            error="Purpose selection is required"
            state="error"
            recommendedPurpose="Debrief"
          />
          <p className="text-sm text-red-600 mt-2">
            Purpose selection is required
          </p>
        </div>

        {/* Example 5: Disabled State */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Disabled State</h3>
          <p className="text-sm text-gray-600 mb-4">
            Component in disabled state with value
          </p>
          <PurposeAssignmentDropdown
            value="Visitation"
            onChange={() => {}}
            disabled={true}
            placeholder="Disabled dropdown"
          />
        </div>

        {/* Example 6: Large Size with Success State */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Large Size - Success</h3>
          <p className="text-sm text-gray-600 mb-4">
            Large size with success state styling
          </p>
          <PurposeAssignmentDropdown
            value="Pre-meeting"
            onChange={() => {}}
            size="lg"
            state="success"
            showRemoveButton={true}
            onRemove={() => console.log('Large assignment removed')}
          />
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Usage Instructions</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <strong>Auto-Recommendation:</strong> Component automatically suggests purpose based on teacher&apos;s schedule context</li>
          <li>• <strong>Teaching Period → Observation:</strong> When teacher is actively teaching</li>
          <li>• <strong>Prep Period → Pre-meeting:</strong> When teacher has prep/planning time</li>
          <li>• <strong>Other → Debrief:</strong> Default fallback for other periods</li>
          <li>• <strong>Remove Button:</strong> Click X icon to clear assignment and remove event</li>
          <li>• <strong>Keyboard Navigation:</strong> Use Tab, Space, Enter, and Arrow keys for accessibility</li>
          <li>• <strong>Visual States:</strong> Component shows different styling for error, success, and disabled states</li>
        </ul>
      </div>

      {/* Integration Preview */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 mb-3">Integration Preview</h3>
        <p className="text-sm text-green-800 mb-4">
          This component will be integrated into the Master Schedule Builder next to static teacher names
        </p>
        <div className="bg-white border border-gray-200 rounded p-3 inline-flex items-center gap-3">
          <span className="text-sm font-medium text-gray-900">Sarah Johnson</span>
          <PurposeAssignmentDropdown
            value={selectedPurpose1}
            onChange={setSelectedPurpose1}
            onRemove={handleRemove1}
            recommendedPurpose={recommendedPurpose}
            size="sm"
            placeholder="Add purpose"
          />
        </div>
      </div>
    </div>
  )
} 