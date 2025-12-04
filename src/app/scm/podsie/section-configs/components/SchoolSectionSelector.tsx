import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { Schools, AllSections } from "@schema/enum/313";
import type { SchoolsType, AllSectionsType } from "@schema/enum/313";

interface SchoolSectionSelectorProps {
  selectedSchool: SchoolsType | "";
  selectedSection: AllSectionsType | "";
  onSchoolChange: (school: SchoolsType | "") => void;
  onSectionChange: (section: AllSectionsType | "") => void;
  onFetchPodsie: () => void;
  fetchingPodsie: boolean;
}

export function SchoolSectionSelector({
  selectedSchool,
  selectedSection,
  onSchoolChange,
  onSectionChange,
  onFetchPodsie,
  fetchingPodsie
}: SchoolSectionSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Select Section</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            School
          </label>
          <select
            value={selectedSchool}
            onChange={(e) => onSchoolChange(e.target.value as SchoolsType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select School</option>
            {Schools.map(school => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class Section
          </label>
          <select
            value={selectedSection}
            onChange={(e) => onSectionChange(e.target.value as AllSectionsType)}
            disabled={!selectedSchool}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select Section</option>
            {AllSections.map(section => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={onFetchPodsie}
        disabled={!selectedSection || fetchingPodsie}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ArrowPathIcon className={`w-5 h-5 ${fetchingPodsie ? 'animate-spin' : ''}`} />
        {fetchingPodsie ? 'Fetching...' : 'Fetch from Podsie'}
      </button>
    </div>
  );
}
