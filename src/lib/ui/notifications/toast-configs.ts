import { EntityToastConfig } from './types';
import { getEntityDisplayName } from './entity-messages';

export function createDefaultToastConfig(entityType: string): EntityToastConfig {
  const displayName = getEntityDisplayName(entityType);
  return {
    create: {
      loading: `Creating ${displayName}...`,
      success: `${displayName} created successfully!`,
      error: `Failed to create ${displayName}`
    },
    update: {
      loading: `Updating ${displayName}...`,
      success: `${displayName} updated successfully!`,
      error: `Failed to update ${displayName}`
    },
    delete: {
      loading: `Deleting ${displayName}...`,
      success: `${displayName} deleted successfully!`,
      error: `Failed to delete ${displayName}`
    }
  };
} 