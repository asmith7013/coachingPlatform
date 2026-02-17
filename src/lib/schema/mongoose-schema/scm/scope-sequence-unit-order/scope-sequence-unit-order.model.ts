import mongoose from "mongoose";
import {
  standardSchemaOptions,
  standardDocumentFields,
} from "@mongoose-schema/shared-options";

// =====================================
// SCOPE SEQUENCE UNIT ORDER MODEL
// =====================================

const SCOPE_SEQUENCE_TAG_VALUES = [
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Algebra 1",
] as const;

const GRADE_VALUES = ["6", "7", "8", "Algebra 1"] as const;

// Unit order item subdocument schema
const UnitOrderItemSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    unitNumber: { type: Number, required: true },
    unitName: { type: String, required: true },
    grade: { type: String, required: true, enum: GRADE_VALUES },
  },
  { _id: false },
);

const scopeSequenceUnitOrderFields = {
  scopeSequenceTag: {
    type: String,
    required: true,
    unique: true,
    index: true,
    enum: SCOPE_SEQUENCE_TAG_VALUES,
  },
  units: {
    type: [UnitOrderItemSchema],
    default: [],
  },

  ...standardDocumentFields,
};

const ScopeSequenceUnitOrderSchema = new mongoose.Schema(
  scopeSequenceUnitOrderFields,
  {
    ...standardSchemaOptions,
    collection: "scope-sequence-unit-order",
  },
);

// Delete existing model to force schema refresh
if (mongoose.models.ScopeSequenceUnitOrder) {
  delete mongoose.models.ScopeSequenceUnitOrder;
}

export const ScopeSequenceUnitOrderModel = mongoose.model(
  "ScopeSequenceUnitOrder",
  ScopeSequenceUnitOrderSchema,
);
