'use client';

import { WizardContainer } from './components/WizardContainer';

export default function WorkedExampleCreatorPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto" style={{ maxWidth: '1600px' }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Worked Example</h1>
          <p className="text-gray-600 text-sm mt-1">
            Generate AI-powered worked example slide decks from mastery check questions or other sources
          </p>
        </div>

        <WizardContainer />
      </div>
    </div>
  );
}
