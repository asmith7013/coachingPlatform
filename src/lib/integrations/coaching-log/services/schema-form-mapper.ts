import { CoachingLogInput, createCoachingLogDefaults } from '@zod-schema/visits/coaching-log';
import { 
  BooleanFieldMappings, 
  EnumFieldMappings, 
  NYCCoachMapping,
  getSmartBooleanDefault,
  transformBooleanForForm 
} from '@/lib/ui/forms/fieldConfig/coaching/coaching-log';
import { getImplementationOptions, getPrimaryStrategyOptions } from '@/lib/ui/constants/coaching-log';
import { VisitScheduleBlock } from '@zod-schema/schedules/schedule-events';

interface EventData {
  name: string[];
  role: string;
  activity: string;
  duration: string;
}

export interface FormOverrides {
  schoolName?: string;
  districtName?: string;
  coachName?: string;
  visitDate?: string;
  modeDone?: string;
  teacherCount?: number;
  schoolGradeLevels?: string[];
  visitId?: string;
  events?: EventData[];           // ← For form automation (transformed)
  timeBlocks?: VisitScheduleBlock[]; // ← For banner display (raw)
}

/**
 * Schema-driven form mapper that automatically converts CoachingLog schema data
 * to form field values using field configuration and smart defaults
 */
export class SchemaFormMapper {
  
  /**
   * Map CoachingLog schema data to form field values
   * Uses schema defaults and field configuration for consistent mapping
   */
  mapToFormFields(
    coachingLog: Partial<CoachingLogInput>,
    overrides: FormOverrides = {}
  ): Record<string, string | number | boolean | string[]> {
    
    // Start with schema defaults
    const enhancedDefaults = this.getEnhancedDefaults(coachingLog, overrides);
    
    // Map each field type using appropriate strategy
    const formFields = {
      // Boolean fields - use field configuration
      ...this.mapBooleanFields(enhancedDefaults),
      
      // Enum fields - direct mapping with fallbacks
      ...this.mapEnumFields(enhancedDefaults),
      
      // Numeric fields - with smart defaults
      ...this.mapNumericFields(enhancedDefaults, overrides),
      
      // Text fields - direct mapping
      ...this.mapTextFields(enhancedDefaults),
      
      // Special fields - custom logic
      ...this.mapSpecialFields(enhancedDefaults, overrides),
      
      // Override fields - from visit data or user input
      ...this.mapOverrideFields(overrides),
    };
    
    return formFields;
  }
  
  /**
   * Get enhanced defaults by combining schema defaults with computed values
   */
  private getEnhancedDefaults(
    coachingLog: Partial<CoachingLogInput>,
    _overrides: FormOverrides
  ): CoachingLogInput {
    // Use schema defaults as base
    const baseDefaults = createCoachingLogDefaults();
    
    // Apply smart defaults for boolean fields
    const smartBooleanDefaults = {
      oneOnOneCoachingDone: getSmartBooleanDefault('oneOnOneCoachingDone', coachingLog),
      microPLDone: getSmartBooleanDefault('microPLDone', coachingLog),
      modelingPlanningDone: getSmartBooleanDefault('modelingPlanningDone', coachingLog),
      walkthroughDone: getSmartBooleanDefault('walkthroughDone', coachingLog),
      adminMeet: getSmartBooleanDefault('adminMeet', coachingLog),
      isContractor: getSmartBooleanDefault('isContractor', coachingLog),
      // DEPRECATED: Keep for backward compatibility
      CoachingDone: getSmartBooleanDefault('CoachingDone', coachingLog),
    };
    
    // Compute NYC status
    const NYCDone = this.determineNYCCoachStatus({
      ...baseDefaults,
      ...coachingLog,
      ...smartBooleanDefaults
    });
    
    return {
      ...baseDefaults,
      ...coachingLog,
      ...smartBooleanDefaults,
      NYCDone,
    };
  }
  
  /**
   * Map boolean fields using field configuration
   */
  private mapBooleanFields(data: CoachingLogInput): Record<string, string> {
    const booleanFields: Record<string, string> = {};
    
    // ✅ ADD: Debug logging to understand the data flow
    console.log('🐛 Input coaching log data for boolean fields:', {
      oneOnOneCoachingDone: data.oneOnOneCoachingDone,
      microPLDone: data.microPLDone,
      modelingPlanningDone: data.modelingPlanningDone,
      microPLTopic: data.microPLTopic,
      microPLDuration: data.microPLDuration,
      modelTopic: data.modelTopic,
      modelDuration: data.modelDuration,
    });
    
    // Use field configuration for consistent boolean mapping
    Object.keys(BooleanFieldMappings).forEach(fieldName => {
      const key = fieldName as keyof typeof BooleanFieldMappings;
      const value = data[key] as boolean;
      const transformedValue = transformBooleanForForm(key, value);
      
      booleanFields[fieldName] = transformedValue;
      
      // ✅ ADD: Log each transformation
      console.log(`🔄 ${fieldName}: ${value} → "${transformedValue}"`);
    });
    
    console.log('🐛 Final boolean field mappings:', booleanFields);
    return booleanFields;
  }
  
  /**
   * Map enum fields with smart hierarchical selection
   */
  private mapEnumFields(data: CoachingLogInput): Record<string, string> {
    return {
      reasonDone: data.reasonDone || 'No',
      totalDuration: data.totalDuration || EnumFieldMappings.totalDuration.options[0],
      Solvestouchpoint: this.mapSolvesTouchpointValue(data.solvesTouchpoint || EnumFieldMappings.solvesTouchpoint.options[0]),
      
      // NEW: Admin fields with smart defaults
      NYCSolvesAdmin: data.NYCSolvesAdmin || this.determineNYCSolvesAdminDefault(data),
      adminDone: data.adminDone || this.determineAdminDoneDefault(data),
      
      // Hierarchical fields with smart selection
      implementationIndicator: this.getImplementationIndicator(data),
      PrimaryStrategy: this.getPrimaryStrategyCategory(data),
      solvesSpecificStrategy: this.getSolvesSpecificStrategy(data),
    };
  }
  
  /**
   * Map numeric fields with enhanced defaults
   */
  private mapNumericFields(data: CoachingLogInput, overrides: FormOverrides): Record<string, string> {
    return {
      teachersSupportedNumber: (
        overrides.teacherCount?.toString() || 
        data.teachersSupportedNumber?.toString() || 
        '1'
      ),
      microPLDuration: data.microPLDuration?.toString() || '',
      modelDuration: data.modelDuration?.toString() || '',
      adminMeetDuration: data.adminMeetDuration?.toString() || '',
      schoolTravelDuration: data.schoolTravelDuration?.toString() || '76',
      finalTravelDuration: data.finalTravelDuration?.toString() || '76',
    };
  }
  
  /**
   * Map text fields directly
   */
  private mapTextFields(data: CoachingLogInput): Record<string, string> {
    return {
      microPLTopic: data.microPLTopic || '',
      modelTopic: data.modelTopic || '',
    };
  }
  
  /**
   * Map special fields with custom logic
   */
  private mapSpecialFields(data: CoachingLogInput, overrides: FormOverrides): Record<string, string | string[]> {
    return {
      NYCDone: NYCCoachMapping.transformToForm(data.NYCDone || false),
      
      // ✅ FIXED: Enhanced grade levels with proper fallback chain
      NYCSolvesGradeLevels: this.getGradeLevelsForForm(data, overrides),
      
      // Enhanced teacher support types
      teachersSupportedType: (
        data.teachersSupportedTypes?.length ? 
        data.teachersSupportedTypes : 
        ['None of the above']
      ),
    };
  }
  
  /**
   * ✅ NEW: Dedicated method for grade level resolution
   */
  private getGradeLevelsForForm(data: CoachingLogInput, overrides: FormOverrides): string[] {
    console.log('🐛 Grade levels debug:', {
      fromOverrides: overrides.schoolGradeLevels,
      fromData: data.gradeLevelsSupported,
      schoolGradeLevels: overrides.schoolGradeLevels?.length || 0
    });
    
    // Priority order: school data > coaching log data > defaults
    const gradeLevels = 
      overrides.schoolGradeLevels?.length ? overrides.schoolGradeLevels :
      data.gradeLevelsSupported?.length ? data.gradeLevelsSupported :
      this.getDefaultGradeLevels();
      
    console.log('✅ Final grade levels for form:', gradeLevels);
    return gradeLevels;
  }
  
  /**
   * ✅ NEW: Smart default grade levels based on coaching context
   */
  private getDefaultGradeLevels(): string[] {
    // Default to middle school grades for math coaching
    return ['6th Grade', '7th Grade', '8th Grade'];
  }
  
  /**
   * Map override fields from visit data or user input
   */
  private mapOverrideFields(overrides: FormOverrides): Record<string, string> {
    return {
      schoolName: overrides.schoolName || '',
      districtName: overrides.districtName || '',
      coachName: overrides.coachName || 'Coach',
      coachingDate: overrides.visitDate || new Date().toISOString().split('T')[0],
      modeDone: overrides.modeDone || 'In-person',
    };
  }
  
  // Helper methods for hierarchical field selection
  
  private getImplementationIndicator(data: CoachingLogInput): string {
    const experience = data.implementationExperience || 'First year of Implementation';
    const options = getImplementationOptions(experience);
    return data.implementationFocus || options[0] || 'Doing the Math: Lesson Planning';
  }
  
  private getPrimaryStrategyCategory(data: CoachingLogInput): string {
    return data.primaryStrategyCategory || data.primaryStrategy || 'In-class support';
  }
  
  private getSolvesSpecificStrategy(data: CoachingLogInput): string {
    const category = this.getPrimaryStrategyCategory(data);
    const options = getPrimaryStrategyOptions(category);
    return data.primaryStrategySpecific || data.solvesSpecificStrategy || options[0] || 'Modeling full lesson';
  }
  
  private mapSolvesTouchpointValue(value: string): string {
    const valueMap: Record<string, string> = {
      'Teacher support': 'Teacher OR teacher & leader support',
      'Leader support only': 'Leader support only', 
      'Teacher OR teacher & leader support': 'Teacher OR teacher & leader support'
    };
    return valueMap[value] || value;
  }
  
  private determineNYCCoachStatus(data: CoachingLogInput): boolean {
    // If we have SOLVES-specific data, we're a NYC Solves coach
    if (data.solvesTouchpoint && data.solvesTouchpoint !== 'No') {
      return true;
    }
    
    // If we have implementation experience data, likely NYC Solves
    if (data.implementationExperience) {
      return true;
    }
    
    // If we have primary strategy data, likely NYC Solves  
    if (data.primaryStrategy || data.primaryStrategyCategory) {
      return true;
    }
    
    // Default to false if no NYC-specific data
    return false;
  }
  
  /**
   * Determine smart default for NYCSolvesAdmin field
   */
  private determineNYCSolvesAdminDefault(data: CoachingLogInput): string {
    if (data.adminMeet === true) {
      return "Yes - debriefed teacher support only";
    }
    if (data.solvesTouchpoint?.includes('Leader support')) {
      return "Yes - provided leader specific support";
    }
    return "No";
  }
  
  /**
   * Determine smart default for adminDone field
   */
  private determineAdminDoneDefault(data: CoachingLogInput): string {
    if (data.adminMeet === true) return "Yes";
    if (data.adminMeet === false) return "No";
    return data.solvesTouchpoint?.includes('Leader support') ? "Yes" : "No";
  }
} 