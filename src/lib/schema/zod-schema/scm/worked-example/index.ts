// Re-export all worked example schemas

// Deck schema (main schema for saved decks)
export {
  WorkedExampleDeckSchema,
  CreateWorkedExampleDeckSchema,
  DeckVisualTypeSchema,
  SvgSubtypeSchema,
  type WorkedExampleDeck,
  type CreateWorkedExampleDeckInput,
  type HtmlSlide,
  type HtmlSlideScript,
  type DeckVisualType,
  type SvgSubtype,
} from './deck';

// Slide constants (pixel dimensions)
export { SLIDE_CONSTANTS, type SlideRegionBounds } from './slide-constants';

// Card schemas (atomic content units)
export {
  CardTypeSchema,
  BaseCardSchema,
  ContentCardSchema,
  SvgCardSchema,
  CfuCardSchema,
  AnswerCardSchema,
  CardDefinitionSchema,
  type CardType,
  type ContentCard,
  type SvgCard,
  type CfuCard,
  type AnswerCard,
  type CardDefinition,
} from './slide-cards';

// Region schemas (layout system)
export {
  RegionPositionSchema,
  LayoutPresetNameSchema,
  RowConfigSchema,
  LayoutPresetSchema,
  LAYOUT_PRESETS,
  calculateRegionBounds,
  type RegionPosition,
  type LayoutPresetName,
  type RowConfig,
  type LayoutPreset,
} from './slide-regions';
