"use client";

import { WizardContainer } from "./components/shared/WizardContainer";

export default function WorkedExampleCreatorPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto" style={{ maxWidth: "1600px" }}>
        <WizardContainer />
      </div>
    </div>
  );
}
