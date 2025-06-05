'use client'

import { useState } from 'react'
import { SectionHeading } from '@composed-components/sectionHeadings/SectionHeading'
import { 
  CalendarIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  FolderIcon
} from '@heroicons/react/24/outline'

export default function SectionHeadingsDemo() {
  const [searchValue1, setSearchValue1] = useState('')
  const [searchValue2, setSearchValue2] = useState('')
  const [searchValue3, setSearchValue3] = useState('')

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Section Heading Components</h1>
        <p className="text-gray-600 mb-8">
          Demonstrating the simplified API with automatic icon display and clean variants.
        </p>
      </div>

      {/* Example 1: Simple Colored Icon (Default) */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Simple Colored Icon (Default)</h2>
        <SectionHeading
          title="Master Schedule"
          subtitle="4 teachers • 5 days • 98 classes"
          icon={CalendarIcon}
          actions={[
            {
              type: 'button',
              variant: 'primary',
              children: 'Edit Schedule',
              onClick: () => alert('Edit Schedule clicked')
            }
          ]}
        />
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>API:</strong> Just provide <code>icon={`{CalendarIcon}`}</code> - defaults to colored style!
          </p>
        </div>
      </div>

      {/* Example 2: Neutral Icon Style */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Neutral Icon Style</h2>
        <SectionHeading
          title="Staff Directory"
          subtitle="24 active members"
          icon={UserGroupIcon}
          iconVariant="neutral"
          actions={[
            {
              type: 'search',
              placeholder: 'Search staff',
              value: searchValue1,
              onChange: setSearchValue1
            }
          ]}
        />
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            Search value: &ldquo;{searchValue1}&rdquo; | <strong>API:</strong> Add <code>iconVariant=&quot;neutral&quot;</code> for subtle style
          </p>
        </div>
      </div>

      {/* Example 3: No Icon - Clean and Simple */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">No Icon - Clean and Simple</h2>
        <SectionHeading
          title="Job Postings"
          actions={[
            {
              type: 'button',
              variant: 'secondary',
              children: 'Share',
              onClick: () => alert('Share clicked')
            },
            {
              type: 'button',
              variant: 'primary',
              children: 'Create',
              onClick: () => alert('Create clicked')
            }
          ]}
        />
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>API:</strong> No icon prop = no icon. Simple!
          </p>
        </div>
      </div>

      {/* Example 4: Compact with Colored Icon */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Compact with Colored Icon</h2>
        <SectionHeading
          title="Quick Reports"
          subtitle="3 pending"
          icon={DocumentTextIcon}
          variant="compact"
          actions={[
            {
              type: 'button',
              variant: 'secondary',
              children: 'View All',
              onClick: () => alert('View All clicked')
            }
          ]}
        />
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>API:</strong> <code>variant=&quot;compact&quot;</code> + <code>icon={`{DocumentTextIcon}`}</code> = smaller colored icon
          </p>
        </div>
      </div>

      {/* Example 5: Compact with Neutral Icon */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Compact with Neutral Icon</h2>
        <SectionHeading
          title="Quick Actions"
          subtitle="Shortcuts"
          icon={CogIcon}
          iconVariant="neutral"
          variant="compact"
          actions={[
            {
              type: 'button',
              variant: 'primary',
              children: 'Add New',
              onClick: () => alert('Add New clicked')
            }
          ]}
        />
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>API:</strong> <code>variant=&quot;compact&quot;</code> + <code>iconVariant=&quot;neutral&quot;</code> = smaller neutral icon
          </p>
        </div>
      </div>

      {/* Example 6: Mixed Actions with Icon */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Mixed Actions with Icon</h2>
        <SectionHeading
          title="Analytics Dashboard"
          subtitle="Last updated 2 hours ago"
          icon={ChartBarIcon}
          iconVariant="neutral"
          actions={[
            {
              type: 'search',
              placeholder: 'Search metrics',
              value: searchValue2,
              onChange: setSearchValue2
            },
            {
              type: 'button',
              variant: 'primary',
              children: 'Export Data',
              onClick: () => alert('Export Data clicked')
            }
          ]}
        />
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            Search value: &ldquo;{searchValue2}&rdquo; | Mixed search + button actions with neutral icon
          </p>
        </div>
      </div>

      {/* Example 7: Search with Sort and Colored Icon */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Search with Sort and Colored Icon</h2>
        <SectionHeading
          title="Document Library"
          subtitle="156 files • 2.3 GB"
          icon={FolderIcon}
          actions={[
            {
              type: 'search',
              placeholder: 'Search documents',
              value: searchValue3,
              onChange: setSearchValue3,
              onSort: () => alert('Sort clicked'),
              sortLabel: 'Sort'
            }
          ]}
        />
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            Search value: &ldquo;{searchValue3}&rdquo; | <strong>API:</strong> Icon defaults to colored when no iconVariant specified
          </p>
        </div>
      </div>

      {/* Example 8: Multiple Buttons with Subtitle Only */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Subtitle Only (No Icon)</h2>
        <SectionHeading
          title="System Settings"
          subtitle="Configuration management"
          actions={[
            {
              type: 'button',
              variant: 'secondary',
              children: 'Export',
              onClick: () => alert('Export clicked')
            },
            {
              type: 'button',
              variant: 'secondary',
              children: 'Import',
              onClick: () => alert('Import clicked')
            },
            {
              type: 'button',
              variant: 'primary',
              children: 'Save Changes',
              onClick: () => alert('Save Changes clicked')
            }
          ]}
        />
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>API:</strong> Subtitle works great without an icon too!
          </p>
        </div>
      </div>

      {/* API Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">🎉 Simplified API Summary</h2>
        <div className="space-y-3 text-sm text-blue-800">
          <div><strong>Want an icon?</strong> → <code>icon={`{SomeIcon}`}</code> (defaults to colored)</div>
          <div><strong>Want neutral style?</strong> → <code>iconVariant=&quot;neutral&quot;</code></div>
          <div><strong>No icon?</strong> → Don&apos;t provide the icon prop</div>
          <div><strong>Compact size?</strong> → <code>variant=&quot;compact&quot;</code></div>
          <div><strong>Subtitle?</strong> → <code>subtitle=&quot;Some text&quot;</code></div>
        </div>
        <p className="text-blue-700 mt-4 font-medium">
          Much cleaner than the old <code>iconVariant=&quot;none&quot;</code> complexity!
        </p>
      </div>
    </div>
  )
} 