"use client";

import { checkFieldConfigCoverage } from "@/lib/dev-utils/checkFieldConfigCoverage";
import { SchoolInputZodSchema } from "@/lib/zod-schema/core/school";
import { StaffMemberInputZodSchema } from "@/lib/zod-schema/core/staff";
import { NoteInputZodSchema } from "@/lib/zod-schema/shared/notes";
import FieldConfig from "@/lib/ui-schema/fieldConfig";

export default function SchemaCoveragePage() {
  if (process.env.NODE_ENV === "development") {
    // Check School schema coverage
    checkFieldConfigCoverage(
      SchoolInputZodSchema,
      FieldConfig["School"],
      "SchoolInputZodSchema",
      "FieldConfig['School']"
    );

    // Check StaffMember schema coverage
    checkFieldConfigCoverage(
      StaffMemberInputZodSchema,
      FieldConfig["StaffMember"],
      "StaffMemberInputZodSchema",
      "FieldConfig['StaffMember']"
    );

    // Check Note schema coverage
    checkFieldConfigCoverage(
      NoteInputZodSchema,
      FieldConfig["Note"],
      "NoteInputZodSchema",
      "FieldConfig['Note']"
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Schema Coverage Check</h1>
      <p className="text-gray-600">
        Check the browser console for schema coverage results.
      </p>
    </div>
  );
} 