import { ExampleCategory } from "../types";
import { BASIC_EXAMPLES } from "./basic";
import { MATH_EXAMPLES } from "./multiplication";
import { RATIO_EXAMPLES } from "./ratios";
import { FRACTION_EXAMPLES } from "./fractions";
import { GEOMETRY_EXAMPLES } from "./triangleRatios";
import { GEOMETRY_DILATION_EXAMPLES } from "./geometry";
import { PROPORTIONAL_EXAMPLES } from "./proportionalRelationships";
import { COORDINATE_PLANE_EXAMPLES } from "./coordinatePlane";
import { TAPE_DIAGRAM_EXAMPLES } from "./tapeDiagrams";
import { ALGEBRA_TILES_EXAMPLES } from "./algebraTiles";

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
    name: "Tape Diagrams",
    examples: TAPE_DIAGRAM_EXAMPLES,
  },
  {
    name: "Proportional Relationships",
    examples: PROPORTIONAL_EXAMPLES,
  },
  {
    name: "Geometry",
    examples: [...GEOMETRY_EXAMPLES, ...GEOMETRY_DILATION_EXAMPLES],
  },
  {
    name: "Coordinate Plane",
    examples: COORDINATE_PLANE_EXAMPLES,
  },
  {
    name: "Algebra Tiles",
    examples: ALGEBRA_TILES_EXAMPLES,
  },
];

// Flat list for backward compatibility
export const EXAMPLE_SKETCHES = [
  ...BASIC_EXAMPLES,
  ...MATH_EXAMPLES,
  ...FRACTION_EXAMPLES,
  ...RATIO_EXAMPLES,
  ...TAPE_DIAGRAM_EXAMPLES,
  ...PROPORTIONAL_EXAMPLES,
  ...GEOMETRY_EXAMPLES,
  ...GEOMETRY_DILATION_EXAMPLES,
  ...COORDINATE_PLANE_EXAMPLES,
  ...ALGEBRA_TILES_EXAMPLES,
];
