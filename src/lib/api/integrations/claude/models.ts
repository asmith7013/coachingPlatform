/**
 * Centralized Claude model configuration
 *
 * Single source of truth for all model IDs used across the application.
 * Update models here when upgrading - all consumers will automatically use new versions.
 */

// Available Claude models (update IDs when new versions release)
export const CLAUDE_MODELS = {
  // Opus - Best for complex reasoning, analysis, multi-step tasks
  OPUS_4_5: 'claude-opus-4-5-20251101',

  // Sonnet - Best balance of speed/quality for generation tasks
  SONNET_4_5: 'claude-sonnet-4-5-20250929',
  SONNET_3_5: 'claude-3-5-sonnet-20241022',

  // Haiku - Fast/cheap for simple tasks
  HAIKU_4_5: 'claude-haiku-4-5-20251001',
  HAIKU_3_5: 'claude-3-5-haiku-20241022',
} as const;

/**
 * Task-based model selection
 *
 * Maps task types to appropriate models based on requirements:
 * - ANALYSIS: Complex reasoning, image analysis, multi-step planning → Opus
 * - GENERATION: Content creation, slide generation → Sonnet 4.5
 * - EDIT: Quick modifications, single-slide edits → Opus
 * - PROCESSING: HTML/text processing, formatting → Sonnet 4.5
 */
export const MODEL_FOR_TASK = {
  // Complex analysis requiring deep reasoning (worth the cost)
  ANALYSIS: CLAUDE_MODELS.OPUS_4_5,

  // Content generation (fast, good quality, cost-effective)
  GENERATION: CLAUDE_MODELS.SONNET_4_5,

  // Quick edits and modifications
  EDIT: CLAUDE_MODELS.OPUS_4_5,

  // Text/HTML processing
  PROCESSING: CLAUDE_MODELS.SONNET_4_5,

  // Default fallback
  DEFAULT: CLAUDE_MODELS.SONNET_4_5,
} as const;

export type ClaudeModel = typeof CLAUDE_MODELS[keyof typeof CLAUDE_MODELS];
export type TaskType = keyof typeof MODEL_FOR_TASK;

/**
 * Get the appropriate model for a given task type
 */
export function getModelForTask(task: TaskType): ClaudeModel {
  return MODEL_FOR_TASK[task] || MODEL_FOR_TASK.DEFAULT;
}
