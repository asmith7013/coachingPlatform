import { ExampleCategory } from "../types";
import { BASIC_EXAMPLES } from "./basic";
import { MATH_EXAMPLES } from "./multiplication";
import { RATIO_EXAMPLES } from "./ratios";
import { FRACTION_EXAMPLES } from "./fractions";
import { GEOMETRY_EXAMPLES } from "./triangleRatios";
import { PROPORTIONAL_EXAMPLES } from "./proportionalRelationships";

export const EXAMPLE_CATEGORIES: ExampleCategory[] = [
  {
    name: "Basic",
    examples: BASIC_EXAMPLES,
  },
  {
    name: "Math",
    examples: MATH_EXAMPLES,
  },
  {
    name: "Fractions",
    examples: FRACTION_EXAMPLES,
  },
  {
    name: "Ratios",
    examples: RATIO_EXAMPLES,
  },
  {
    name: "Proportional Relationships",
    examples: PROPORTIONAL_EXAMPLES,
  },
  {
    name: "Geometry",
    examples: GEOMETRY_EXAMPLES,
  },
];

// Flat list for backward compatibility
export const EXAMPLE_SKETCHES = [
  ...BASIC_EXAMPLES,
  ...MATH_EXAMPLES,
  ...FRACTION_EXAMPLES,
  ...RATIO_EXAMPLES,
  ...PROPORTIONAL_EXAMPLES,
  ...GEOMETRY_EXAMPLES,
];
