// src/lib/integrations/coaching-log/services/playwright-form-filler.ts

import { chromium, Browser, Page } from 'playwright';
import { CoachingLogInput } from '@zod-schema/visits/coaching-log';
// Removed unused hierarchical imports - now handled by schema mapper
import { fetchVisitScheduleData } from '@actions/visits/visit-schedule-data';
import { visitScheduleToEventData } from '../mappers/visit-schedule-to-events';
import { SchemaFormMapper } from './schema-form-mapper';
import { VisitScheduleBlock } from '@zod-schema/schedules/schedule-events';


// Type definitions based on your working JSON structure
interface FormFieldEntry {
  selector: string;
  label: string;
  type?: string;
  value: string | string[] | EventData[] | boolean | number;
  options?: string[];
  organization: {
    section: number;
    index: number;
  };
  i?: number; // For multiple instances of same selector
}

interface EventData {
  name: string[];
  role: string;
  activity: string;
  duration: string;
}

interface FormData {
  [key: string]: string | string[] | EventData[] | boolean | number | undefined;
  events?: EventData[];
}

interface AutomationResult {
  success: boolean;
  message?: string;
  error?: string;
}

interface DropdownSelection {
  unique: string;
  target: string;
  name: string;
  values: string[];
}

interface CheckboxField {
  labelText: string;
  checkboxName: string;
  input?: string[];
}

export class CoachingLogFormFiller {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private readonly formUrl = 'https://tl-coach-log-form-1a0068b965da.herokuapp.com/';
  private currentStaffLookup: Map<string, { _id: string; staffName: string; [key: string]: unknown }> | null = null; // NEW: Store staff lookup

  async initialize(): Promise<void> {
    console.log('Starting CoachingLogFormFiller...');
    
    this.browser = await chromium.launch({ 
      headless: false
    });

    this.page = await this.browser.newPage();

    // Set viewport and window size/position
    await this.page.setViewportSize({ width: 900, height: 750 });
    
    // Set window position to top-left corner (0, 0) and size
    await this.page.evaluate(() => {
      window.resizeTo(900, 750);
      window.moveTo(-20, -20);
    });
    
    await this.page.goto(this.formUrl, { waitUntil: 'networkidle' });
  }

  // NEW: Accept CoachingLogInput directly with optional form-specific overrides
  async fillFormFromSchema(
    coachingLog: CoachingLogInput,
    formOverrides?: {
      schoolName?: string;
      districtName?: string;
      coachName?: string;
      visitDate?: string;     // NEW: from related visit
      modeDone?: string;      // NEW: from related visit
      events?: EventData[];   // ← Used for form automation (transformed data)
      timeBlocks?: VisitScheduleBlock[];  // ← Used for banner display (raw data)
      visitId?: string;       // NEW: for visit record updates
      teacherCount?: number;  // NEW: Add calculated teacher count
      schoolGradeLevels?: string[];  // NEW: Add school grade levels
    }
  ): Promise<AutomationResult> {
    if (!this.page) {
      return { success: false, error: "Browser not initialized. Call initialize() first." };
    }

    try {
      console.log('📝 Filling form from CoachingLog schema data:', coachingLog, 'formOverrides', formOverrides);

      // CALLING BANNER - Log form data being passed
      console.log('🔍 CALLING BANNER - Form overrides being passed:', {
        visitDate: formOverrides?.visitDate,
        eventsCount: formOverrides?.events?.length || 0,
        timeBlocksCount: formOverrides?.timeBlocks?.length || 0,
        schoolName: formOverrides?.schoolName,
        coachName: formOverrides?.coachName,
        fullEvents: formOverrides?.events,
        fullTimeBlocks: formOverrides?.timeBlocks,
        firstEvent: formOverrides?.events?.[0],
        firstTimeBlock: formOverrides?.timeBlocks?.[0]
      });

      // await this.showVisitInfoSideBanner({
      //   date: formOverrides?.visitDate,
      //   timeBlocks: formOverrides?.timeBlocks || [], // ← Now using correct timeBlocks data
      //   schoolName: formOverrides?.schoolName || 'Unknown School',
      //   coachName: formOverrides?.coachName || 'Unknown Coach'
      // });

      // ✅ SINGLE SOURCE OF TRUTH: Map schema to form fields once
      const formData = this.mapSchemaToFormFields(coachingLog, formOverrides);
      
      // ✅ CONSISTENT: Fill all fields from the mapped data (no hardcoded overrides)
      await this.populateDropdownsFromSchema(formData);
      await this.populateContractorFields(formData);
      await this.fillCheckboxFieldsFromSchema(formData);
      await this.fillTextFieldsFromSchema(formData);
      
      // Wait for form to be fully loaded and staff names to be available
      await this.waitForStaffNamesLoaded();
      
      // Handle events if provided
      const events = formOverrides?.events || [];
      if (events.length > 0) {
        console.log('📅 Populating coaching sessions from events:', events.length);
        await this.populateCoachingSessions(events as []);
      }
      
      // ✅ FIXED: Fill strategy dropdowns without overriding previous values
      await this.fillRemainingStrategyFields(formData);

      console.log("✅ Form filled successfully from schema!");
      this.showNotification();

      // Start monitoring for submission (don't await - runs in background)
      const visitId = formOverrides?.visitId;
      this.waitForSubmissionAndCleanup(visitId).catch(console.error);

      return { 
        success: true, 
        message: visitId 
          ? "Form filled - browser monitoring for manual submission" 
          : "Form filled - ready for manual review and submission" 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Error filling form from schema:", errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // NEW: Fill form from Visit ID using new VisitSchedule architecture
  async fillFormFromVisit(
    visitId: string,
    coachingLog: CoachingLogInput,
    formOverrides?: {
      schoolName?: string;
      districtName?: string;
      coachName?: string;
    }
  ): Promise<AutomationResult> {
    if (!this.page) {
      return { success: false, error: "Browser not initialized. Call initialize() first." };
    }

    try {
      console.log('📝 Filling form from Visit ID:', visitId);

      // ✅ NEW: Use server action - single efficient call
      const result = await fetchVisitScheduleData(visitId);
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch visit schedule data');
      }
      
      const scheduleData = result.data;
      
      // Transform to event data for form automation
      const events = visitScheduleToEventData(
        scheduleData.visitSchedule,
        new Map(scheduleData.nycpsStaff.map(staff => [staff._id, staff]))
      );
      
      // NEW: Store staff lookup for banner display
      this.currentStaffLookup = new Map(scheduleData.nycpsStaff.map(staff => [staff._id, staff]));
      
      // ✅ ENHANCED: Better grade level handling with separated data types
      const enhancedOverrides = {
        ...formOverrides,
        visitDate: scheduleData.visit?.date,
        modeDone: scheduleData.visit?.modeDone,
        events: events, // ← Transformed events for form automation
        timeBlocks: scheduleData.visitSchedule?.timeBlocks || [], // ← Raw timeBlocks for banner
        visitId,
        teacherCount: scheduleData.teacherCount,
        // ✅ FIXED: Use proper field name and provide fallbacks
        schoolGradeLevels: scheduleData.school?.gradeLevelsSupported ||
                           scheduleData.visit?.gradeLevelsSupported ||
                           []
      };
      
      console.log('🎯 Enhanced overrides for form:', enhancedOverrides);
      
      // Fill form using existing schema method (unchanged)
      return await this.fillFormFromSchema(coachingLog, enhancedOverrides);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Error filling form from visit:", errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // LEGACY METHOD: Keep for backward compatibility
  async fillForm(jsonData: FormFieldEntry[]): Promise<AutomationResult> {
    console.warn('⚠️ Using legacy fillForm method. Consider using fillFormFromSchema for better type safety.');
    
    if (!this.page) {
      return { success: false, error: "Browser not initialized. Call initialize() first." };
    }

    try {
      const formData = this.convertFormDataToObject(jsonData);
      const events = formData.events;

      if (events) {
        console.log("✅ Successfully extracted events data");
      } else {
        console.warn("⚠️ No events data found.");
      }

      // Fill form sections in order
      await this.selectAllDropdowns("CoachingDone", "Yes", jsonData);
      await this.populateDropdowns(formData);
      await this.fillCheckboxFields(formData);
      await this.fillTextFields(formData);
      await this.populateCoachingSessions(events || []);
      
      const dropdownsToFill = ['implementationIndicator', 'supportCycle', 'PrimaryStrategy', 'solvesSpecificStrategy'];
      await this.fillMultipleDropdowns(dropdownsToFill, formData);

      // Handle complex dropdown selections
      const dropdownSelections: DropdownSelection[] = [
        // { 
        //   unique: "Did you deliver a micro PL at this school today?", 
        //   target: "Names of participants:", 
        //   name: "microPLParticipants[]", 
        //   values: ["James Frey", "Michele Patafio", "Cara Garvey"] 
        // },
        // { 
        //   unique: "Did you deliver a micro PL at this school today?", 
        //   target: "Participants were:", 
        //   name: "microPLParticipantRoles[]", 
        //   values: ["Teacher"] 
        // },
        // { 
        //   unique: "Did you provide coaching, modeling, or planning with a group of teachers at this school today?", 
        //   target: "Names of participants:", 
        //   name: "modelParticipants[]", 
        //   values: ["James Frey", "Michele Patafio"] 
        // },
        // { 
        //   unique: "Did you provide coaching, modeling, or planning with a group of teachers at this school today?", 
        //   target: "Participants were:", 
        //   name: "modelParticipantRoles[]", 
        //   values: ["Teacher"] 
        // }
      ];

      for (const selection of dropdownSelections) {
        await this.selectDropdownAfterLabel(
          selection.unique, 
          selection.target, 
          selection.name, 
          selection.values
        );
      }

      console.log("✅ Form filled successfully!");
      
      // Show notification (if available)
      this.showNotification();

      return { success: true, message: "Form filled successfully - ready for manual review" };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Error filling form:", errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // ✅ ENHANCED: Better boolean to form value mapping
  private mapSchemaToFormFields(
    coachingLog: CoachingLogInput,
    overrides?: {
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
  ): Record<string, string | number | boolean | string[]> {
    
    const mapper = new SchemaFormMapper();
    const baseMapping = mapper.mapToFormFields(coachingLog, overrides);
    
    // ✅ ENSURE consistent boolean to string conversion for form fields
    const formMapping = { ...baseMapping };
    
    // Convert boolean fields to form-expected string values
    const booleanFields = [
      'oneOnOneCoachingDone', 'microPLDone', 'modelingPlanningDone', 'walkthroughDone',
      'adminMeet', 'NYCDone', 'CoachingDone' // Keep CoachingDone for backward compatibility
    ];
    booleanFields.forEach(field => {
      if (typeof formMapping[field] === 'boolean') {
        formMapping[field] = formMapping[field] ? 'Yes' : 'No';
      }
    });
    
    // Note: NYCSolvesAdmin and adminDone are enum fields (not boolean), so no conversion needed
    
    return formMapping;
  }

  // ADD: Ultra-simple fallback helper method
  private getFirstAvailableOption(availableOptions: string[]): string {
    // Filter out empty options and return first valid one
    const validOptions = availableOptions.filter(opt => opt.trim() !== '');
    return validOptions[0] || '';
  }

  // ADD: Simple value mapping method (Fixed: Remove &amp;)
  // private mapSolvesTouchpointValue(value: string): string {
  //   const valueMap: Record<string, string> = {
  //     'Teacher support': 'Teacher OR teacher & leader support',  // Fixed: Raw &
  //     'Leader support only': 'Leader support only', 
  //     'Teacher OR teacher & leader support': 'Teacher OR teacher & leader support'  // Fixed: Raw &
  //   };
  //   return valueMap[value] || value;
  // }

  // // ADD: Determine NYC Coach status from schema data
  // private determineNYCCoachStatus(coachingLog: CoachingLogInput): string {
  //   // If we have SOLVES-specific data, we're a NYC Solves coach
  //   if (coachingLog.solvesTouchpoint && coachingLog.solvesTouchpoint !== 'No') {
  //     return 'Yes, NYC Solves';
  //   }
    
  //   // If we have implementation experience data, likely NYC Solves
  //   if (coachingLog.implementationExperience) {
  //     return 'Yes, NYC Solves';
  //   }
    
  //   // If we have primary strategy data, likely NYC Solves  
  //   if (coachingLog.primaryStrategy || coachingLog.primaryStrategyCategory) {
  //     return 'Yes, NYC Solves';
  //   }
    
  //   // Default to No if no NYC-specific data
  //   return 'No';
  // }

  private convertFormDataToObject(jsonData: FormFieldEntry[]): FormData {
    const formData: FormData = {};
    
    jsonData.forEach(entry => {
      if (entry.selector && entry.value !== undefined) {
        formData[entry.selector] = entry.value;
      }
    });

    console.log("✅ Successfully converted formEdit to formData format.");
    return formData;
  }

  private async selectDropdown(name: string, value: string): Promise<void> {
    if (!this.page) return;

    try {
      const dropdown = this.page.locator(`select[name="${name}"]`);
      await dropdown.waitFor({ state: 'visible', timeout: 5000 });
      
      // Get available options
      const options = await dropdown.locator('option').allTextContents();
      console.log(`📋 Available options for '${name}':`, options);
      console.log(`🎯 Trying to select: '${value}' (from constants)`);
      
      // Try exact match first (value came from constants)
      if (options.includes(value)) {
        await dropdown.selectOption({ label: value });
        console.log(`✅ Selected '${value}' using constants mapping`);
        return;
      }
      
      // Simple fallback: just pick first available option
      const fallbackValue = this.getFirstAvailableOption(options);
      if (fallbackValue) {
        await dropdown.selectOption({ label: fallbackValue });
        console.log(`🔄 FALLBACK: Selected '${fallbackValue}' (first available) instead of '${value}' in '${name}' dropdown.`);
      } else {
        console.error(`❌ No valid options available for '${name}' dropdown.`);
      }
    } catch (error) {
      console.error(`❌ Dropdown '${name}' error:`, error);
    }
  }

  private async selectDate(dateValue: string): Promise<void> {
    if (!this.page || !dateValue) {
      console.error("❌ Error: Date value is undefined.");
      return;
    }

    console.log("📅 Setting date as text:", dateValue);
    
    try {
      // Convert date to MM/DD/YYYY format
      const formattedDate = this.formatDateForForm(dateValue);
      console.log(`📅 Formatted date: ${dateValue} → ${formattedDate}`);
      
      // Simply fill the input field with the formatted date
      const dateInput = this.page.locator('input[name="date"]');
      await dateInput.waitFor({ state: 'visible', timeout: 5000 });
      
      // Clear and fill the input
      await dateInput.fill(formattedDate);
      
      // Trigger change event to ensure React recognizes the change
      await dateInput.dispatchEvent('change');
      await dateInput.dispatchEvent('blur');
      
      console.log(`✅ Successfully set date to: ${formattedDate}`);
      
    } catch (error) {
      console.error("❌ Error setting date:", error);
    }
  }

  /**
   * Convert various date formats to MM/DD/YYYY format expected by the form
   */
  private formatDateForForm(dateValue: string): string {
    try {
      // Handle different input formats
      let dateObj: Date;
      
      // If already in MM/DD/YYYY format, return as-is
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
        return dateValue;
      }
      
      // If in ISO format (YYYY-MM-DD with optional time and timezone)
      if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(dateValue)) {
        dateObj = new Date(dateValue);
      } else {
        // Try parsing as general date
        dateObj = new Date(dateValue);
      }
      
      if (isNaN(dateObj.getTime())) {
        throw new Error(`Invalid date format: ${dateValue}`);
      }
      
      // Format as MM/DD/YYYY using UTC to avoid timezone issues
      const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getUTCDate()).padStart(2, '0');
      const year = dateObj.getUTCFullYear();
      
      return `${month}/${day}/${year}`;
      
    } catch (error) {
      console.error(`❌ Error formatting date "${dateValue}":`, error);
      // Fallback to today's date in correct format using UTC
      const today = new Date();
      const month = String(today.getUTCMonth() + 1).padStart(2, '0');
      const day = String(today.getUTCDate()).padStart(2, '0');
      const year = today.getUTCFullYear();
      return `${month}/${day}/${year}`;
    }
  }

  private async selectCheckboxesFromDropdown(
    labelText: string, 
    checkboxName: string, 
    selectedOptions: string[]
  ): Promise<void> {
    if (!this.page) return;

    try {
      console.log(`🔹 Selecting checkboxes for: ${labelText}`);

      // FIX: Try multiple strategies to find the dropdown
      let dropdownButton;
      
      // Strategy 1: Find by label text
      const labelLocator = this.page.locator(`text="${labelText}"`);
      if (await labelLocator.count() > 0) {
        dropdownButton = labelLocator.locator('xpath=following::button[contains(@class, "dropdown-toggle")][1]');
      }
      
      // Strategy 2: Find by proximity to checkboxes with the target name
      if (!dropdownButton || await dropdownButton.count() === 0) {
        const checkboxContainer = this.page.locator(`input[name="${checkboxName}"]`).first().locator('xpath=ancestor::div[contains(@class, "dropdown")]');
        dropdownButton = checkboxContainer.locator('button.dropdown-toggle');
      }
      
      // Strategy 3: Find all dropdown buttons and filter by content
      if (!dropdownButton || await dropdownButton.count() === 0) {
        const allDropdowns = this.page.locator('button.dropdown-toggle');
        const dropdownCount = await allDropdowns.count();
        console.log(`🔎 Found ${dropdownCount} dropdown buttons on the page.`);
        
        // For grade levels, it's typically the first or second dropdown
        dropdownButton = allDropdowns.first();
      }

      if (!dropdownButton || await dropdownButton.count() === 0) {
        console.error("❌ Dropdown button not found.");
        return;
      }

      console.log("✅ Clicking dropdown button to open...");
      await dropdownButton.click();
      await this.page.waitForTimeout(1000);

      // ADD: Log all available checkbox values
      const allCheckboxes = await this.page.locator(`input[name="${checkboxName}"]`).all();
      console.log(`📋 Found ${allCheckboxes.length} checkboxes for '${checkboxName}'`);
      for (let i = 0; i < allCheckboxes.length; i++) {
        const value = await allCheckboxes[i].getAttribute('value');
        console.log(`  - Checkbox ${i}: value="${value}"`);
      }

      // Select options (existing logic)
      for (const option of selectedOptions) {
        const checkboxLocator = this.page.locator(`xpath=//input[@name="${checkboxName}" and @value="${option}"]`);

        if (await checkboxLocator.count() === 0) {
          console.error(`❌ Checkbox for '${option}' not found.`);
          continue;
        }

        if (!(await checkboxLocator.isChecked())) {
          console.log(`✅ Selecting '${option}'`);
          await checkboxLocator.click();
          await this.page.waitForTimeout(300);
        } else {
          console.log(`⚠️ '${option}' is already selected.`);
        }
      }

      console.log("🔍 Closing the dropdown...");
      await dropdownButton.click();
      console.log(`✅ Successfully completed ${checkboxName}`);
    } catch (error) {
      console.error(`❌ Error in ${checkboxName}:`, error);
    }
  }

  private async selectDropdownAfterLabel(
    uniqueLabelText: string,
    targetLabelText: string,
    dropdownName: string,
    selectedOptions: string[]
  ): Promise<void> {
    if (!this.page) return;

    try {
      console.log(`🔹 Selecting dropdown for '${targetLabelText}' after '${uniqueLabelText}'`);

      const uniqueLabelLocator = this.page.locator(`text="${uniqueLabelText}"`);
      await uniqueLabelLocator.waitFor({ state: 'attached', timeout: 5000 });

      console.log(`✅ Unique label '${uniqueLabelText}' found.`);

      const targetLabelLocator = uniqueLabelLocator
        .locator(`xpath=following::*[contains(text(), "${targetLabelText}")]`)
        .filter({ hasText: targetLabelText })
        .first();
      await targetLabelLocator.waitFor({ state: 'attached', timeout: 5000 });

      console.log(`✅ Target label '${targetLabelText}' found.`);

      const dropdownButtonLocator = targetLabelLocator
        .locator(`xpath=following::div[contains(@class, "dropdown")]/button`)
        .first();
      await dropdownButtonLocator.waitFor({ state: 'attached', timeout: 5000 });

      console.log(`✅ Clicking dropdown button for '${dropdownName}'`);
      await dropdownButtonLocator.click();
      await this.page.waitForTimeout(1000);

      for (const option of selectedOptions) {
        const checkboxLocator = this.page.locator(`xpath=//input[@name="${dropdownName}" and @value="${option}"]`);

        if (await checkboxLocator.count() === 0) {
          console.error(`❌ Checkbox for '${option}' not found.`);
          continue;
        }

        if (!(await checkboxLocator.isChecked())) {
          console.log(`✅ Selecting '${option}'`);
          await checkboxLocator.click();
          await this.page.waitForTimeout(300);
        } else {
          console.log(`⚠️ '${option}' is already selected.`);
        }
      }

      console.log(`🔍 Closing the dropdown for '${dropdownName}'`);
      await dropdownButtonLocator.click();
      console.log(`✅ Successfully completed selection for '${dropdownName}'`);
    } catch (error) {
      console.error(`❌ Error selecting dropdown '${dropdownName}' after '${targetLabelText}':`, error);
    }
  }

  // NEW: Schema-based dropdown population
  // ✅ FIXED: Single, comprehensive dropdown population method
  private async populateDropdownsFromSchema(formData: Record<string, string | number | boolean | string[]>): Promise<void> {
    
    // ✅ ALL dropdown fields handled consistently from schema
    const allDropdownFields = [
      "coachName",
      "districtName", 
      "schoolName",
      "modeDone",
      "isContractor",
      "coachingDate",
      "reasonDone",        // ✅ FIXED: Only set once from schema
      "NYCDone",
      "walkthroughDone",
      "Solvestouchpoint",
      "totalDuration",
      "schoolTravelDuration",  // Will be skipped if not contractor
      "finalTravelDuration",   // Will be skipped if not contractor
      "NYCSolvesAdmin",       // NEW: Admin meeting type
      "adminDone"             // NEW: Admin progress meeting
    ];

    for (const field of allDropdownFields) {
      if (formData[field] !== undefined) {
        if (field === 'coachingDate') {
          await this.selectDate(formData[field] as string);
        } else {
          await this.selectDropdown(field, formData[field] as string);
          
          // Wait for conditional fields after specific selections
          if (field === 'isContractor' || field === 'NYCDone') {
            console.log(`⏳ Waiting for ${field}-dependent fields to appear...`);
            await this.page?.waitForTimeout(2000);
          }
        }
      }
    }

    // ✅ FIXED: Handle CoachingDone consistently from schema
    await this.handleCoachingDoneFromSchema(formData);

    // Wait for any remaining conditional fields
    console.log('⏳ Waiting for all conditional fields to appear...');
    await this.page?.waitForTimeout(3000);
  }

  // ✅ NEW: Handle CoachingDone dropdowns individually from schema
  private async handleCoachingDoneFromSchema(formData: Record<string, string | number | boolean | string[]>): Promise<void> {
    console.log('🔹 Setting CoachingDone dropdowns individually...');
    
    // Map schema fields to form dropdown values
    const coachingDoneValues = [
      formData.oneOnOneCoachingDone ? 'Yes' : 'No',      // Dropdown #1: 1:1 coaching
      formData.microPLDone ? 'Yes' : 'No',               // Dropdown #2: micro PL  
      formData.modelingPlanningDone ? 'Yes' : 'No'       // Dropdown #3: modeling/planning
    ];
    
    console.log('🎯 Setting CoachingDone values:', coachingDoneValues);
    
    // Set each dropdown individually using existing selectDropdownByIndex method
    for (let i = 0; i < coachingDoneValues.length; i++) {
      await this.selectDropdownByIndex("CoachingDone", i, coachingDoneValues[i]);
    }
    
    console.log('✅ Successfully set all CoachingDone dropdowns individually');
  }

  // ✅ LEGACY: Keep for backward compatibility (but prefer handleCoachingDoneFromSchema)
  private async handleCoachingDoneDropdowns(): Promise<void> {
    console.log('🔹 Setting all CoachingDone dropdowns to "No"...');
    
    try {
      // Method 1: Use .all() (recommended)
      await this.selectAllDropdownsWithSameName("CoachingDone", "No");
      
    } catch {
      console.warn('⚠️ .all() method failed, trying individual selection...');
      
      // Fallback: Try each dropdown individually by index
      const dropdownCount = await this.page!.locator('select[name="CoachingDone"]').count();
      
      for (let i = 0; i < dropdownCount; i++) {
        await this.selectDropdownByIndex("CoachingDone", i, "No");
      }
    }
  }

  // Solution 1: Use .all() to select all matching elements
  private async selectAllDropdownsWithSameName(name: string, value: string): Promise<void> {
    if (!this.page) return;

    try {
      console.log(`🔹 Selecting '${value}' for ALL '${name}' dropdowns...`);

      // Get all dropdowns with the same name
      const dropdowns = this.page.locator(`select[name="${name}"]`);
      const dropdownCount = await dropdowns.count();
      
      if (dropdownCount === 0) {
        console.warn(`⚠️ No '${name}' dropdowns found.`);
        return;
      }

      console.log(`✅ Found ${dropdownCount} '${name}' dropdown(s). Setting all to '${value}'...`);

      // Use .all() to get all matching elements, then iterate
      const allDropdowns = await dropdowns.all();
      
      for (let i = 0; i < allDropdowns.length; i++) {
        const dropdown = allDropdowns[i];
        
        try {
          const options = await dropdown.locator('option').allTextContents();
          console.log(`📋 Dropdown #${i + 1} options:`, options);
          
          if (options.includes(value)) {
            await dropdown.selectOption({ label: value });
            console.log(`✅ Set dropdown #${i + 1} to '${value}'`);
          } else {
            console.warn(`⚠️ Value '${value}' not found in dropdown #${i + 1}`);
          }
          
          // Small delay between selections
          await this.page.waitForTimeout(300);
          
        } catch (error) {
          console.error(`❌ Error with dropdown #${i + 1}:`, error);
        }
      }

      console.log(`✅ Successfully processed all ${dropdownCount} '${name}' dropdowns.`);
    } catch (error) {
      console.error(`❌ Error selecting '${value}' for '${name}' dropdowns:`, error);
    }
  }

  // ✅ ENHANCED: Use .nth() to target specific instances with better value matching
  private async selectDropdownByIndex(name: string, index: number, value: string): Promise<void> {
    if (!this.page) return;

    try {
      console.log(`🔹 Setting '${name}' dropdown #${index + 1} to '${value}'...`);

      const dropdown = this.page.locator(`select[name="${name}"]`).nth(index);
      
      await dropdown.waitFor({ state: 'visible', timeout: 5000 });
      
      const options = await dropdown.locator('option').allTextContents();
      console.log(`📋 Dropdown #${index + 1} options:`, options);
      
      // Handle case-insensitive matching for form values like "yes"/"no" vs "Yes"/"No"
      const matchingOption = options.find(opt => 
        opt.toLowerCase() === value.toLowerCase() || 
        (value.toLowerCase() === 'yes' && opt.toLowerCase() === 'yes') ||
        (value.toLowerCase() === 'no' && opt.toLowerCase() === 'no')
      );
      
      if (matchingOption) {
        await dropdown.selectOption({ label: matchingOption });
        console.log(`✅ Set dropdown #${index + 1} to '${matchingOption}'`);
      } else {
        console.warn(`⚠️ Value '${value}' not found in dropdown #${index + 1}, available:`, options);
        // Fallback to first valid option
        const fallback = options.find(opt => opt.trim() !== '');
        if (fallback) {
          await dropdown.selectOption({ label: fallback });
          console.log(`🔄 Used fallback '${fallback}' for dropdown #${index + 1}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error setting dropdown #${index + 1}:`, error);
    }
  }

  // ✅ FIXED: Fill strategy fields using correct methods for single vs multiple dropdowns
  private async fillRemainingStrategyFields(formData: Record<string, string | number | boolean | string[]>): Promise<void> {
    // Single-instance fields (unique across the form)
    const singleFields = ['implementationIndicator', 'supportCycle'];
    
    for (const field of singleFields) {
      if (formData[field]) {
        console.log(`📝 Setting single strategy field: ${field} = ${formData[field]}`);
        await this.selectDropdown(field, formData[field] as string);
      }
    }
    
    // Multi-instance fields (repeated across grade levels) - use selectAllDropdowns
    const multiFields = ['PrimaryStrategy', 'solvesSpecificStrategy'];
    
    for (const field of multiFields) {
      if (formData[field]) {
        console.log(`📝 Setting multi-grade strategy field: ${field} = ${formData[field]} (all grade levels)`);
        await this.selectAllDropdowns(field, formData[field] as string, []);
      }
    }
  }

  // NEW METHOD: Handle contractor-specific fields
  private async populateContractorFields(formData: Record<string, string | number | boolean | string[]>): Promise<void> {
    // Only process if contractor is true
    if (formData.isContractor !== 'Yes') {
      console.log('⏭️ Skipping contractor fields - not a contractor');
      return;
    }

    console.log('🔹 Filling contractor-specific fields...');
    
    const contractorFields = ["schoolTravelDuration", "finalTravelDuration"];
    
    for (const field of contractorFields) {
      if (formData[field]) {
        console.log(`📝 Filling contractor field: ${field} = ${formData[field]}`);
        await this.selectDropdown(field, formData[field] as string);
      }
    }
    
    console.log('✅ Contractor fields completed');
  }

  private async populateDropdowns(formData: FormData): Promise<void> {
    const dropdownFields = [
      "coachName",
      "districtName", 
      "schoolName",
      "modeDone",
      "isContractor",
      "NYCDone",
      "Solvestouchpoint",
      "coachingDate",
      "schoolTravelDuration",
      "finalTravelDuration",
      "modelDuration",
      "microPLDuration",
      "adminDone",
      "walkthroughDone",
      "reasonDone",
      "totalDuration",
      "NYCSolvesAdmin",
      "adminDuration",
    ];

    for (const field of dropdownFields) {
      if (formData[field]) {
        if (field === 'coachingDate') {
          await this.selectDate(formData[field] as string);
        } else {
          await this.selectDropdown(field, formData[field] as string);
        }
      }
    }
  }

  private async selectAllDropdowns(
    selector: string, 
    value: string, 
    jsonData: FormFieldEntry[]
  ): Promise<void> {
    if (!this.page) return;

    try {
      console.log(`🔹 Selecting '${value}' for all '${selector}' dropdowns...`);

      const dropdowns = this.page.locator(`select[name="${selector}"]`);
      const dropdownCount = await dropdowns.count();
      
      if (dropdownCount === 0) {
        console.warn(`⚠️ No '${selector}' dropdowns found.`);
        return;
      }

      console.log(`✅ Found ${dropdownCount} '${selector}' dropdown(s). Processing...`);

      // FIX: Use .all() instead of .nth() in a loop to avoid strict mode issues
      const allDropdowns = await dropdowns.all();

      for (let i = 0; i < allDropdowns.length; i++) {
        const dropdown = allDropdowns[i];
        
        try {
          const options = await dropdown.locator('option').allTextContents();
          console.log(`📋 Available options for '${selector}' dropdown #${i + 1}:`, options);
          
          let finalValue = value;

          // Check for JSON override
          const jsonEntry = jsonData.find(entry => entry.selector === selector && entry.i === i);
          if (jsonEntry && jsonEntry.value) {
            finalValue = jsonEntry.value as string;
            console.log(`🔄 Overriding with JSON data value: '${finalValue}' for '${selector}' dropdown #${i + 1}`);
          }

          console.log(`🎯 Trying to select: '${finalValue}' for dropdown #${i + 1}`);
          
          if (options.includes(finalValue)) {
            await dropdown.selectOption({ label: finalValue });
            console.log(`✅ Selected '${finalValue}' for '${selector}' dropdown #${i + 1}`);
          } else {
            const fallbackValue = this.getFirstAvailableOption(options);
            if (fallbackValue) {
              await dropdown.selectOption({ label: fallbackValue });
              console.log(`🔄 FALLBACK: Selected '${fallbackValue}' (first available) instead of '${finalValue}' for '${selector}' dropdown #${i + 1}`);
            } else {
              console.error(`❌ No valid options available for '${selector}' dropdown #${i + 1}`);
            }
          }
          
          // Small delay between dropdown selections
          await this.page.waitForTimeout(300);
          
        } catch (error) {
          console.error(`❌ Error with '${selector}' dropdown #${i + 1}:`, error);
        }
      }

      console.log(`✅ Successfully processed all '${selector}' dropdowns.`);
    } catch (error) {
      console.error(`❌ Error selecting '${value}' for '${selector}' dropdowns:`, error);
    }
  }

  private async populateCoachingSessions(events: EventData[]): Promise<void> {
    if (!this.page) return;

    try {
      console.log("🔹 Populating Coaching Sessions with enhanced handling...");

      // Split multi-person events into individual rows
      const splitEvents = this.splitMultiPersonEvents(events);
      console.log(`✅ Processing ${splitEvents.length} coaching sessions (split from ${events.length} events)`);

      // Ensure correct number of rows exist
      await this.ensureCorrectRowCount(splitEvents.length);

      // Populate each row with retry logic
      for (let i = 0; i < splitEvents.length; i++) {
        await this.populateSessionRowWithRetry(i, splitEvents[i]);
      }

          console.log("✅ Enhanced coaching session population completed!");
    
  } catch (error) {
    console.error("❌ Error in enhanced coaching session population:", error);
    throw error; // Let caller handle the error
  }
}

/**
 * Wait for staff names to be loaded in coachee dropdowns
 * Replaces the hardcoded 30-second wait with dynamic detection
 */
private async waitForStaffNamesLoaded(): Promise<void> {
  if (!this.page) return;

  try {
    console.log('⏳ Waiting for staff names to load in coachee dropdowns...');
    
    // Wait for at least one coachee dropdown to exist
    await this.page.waitForSelector('select[name="coacheeName"]', { timeout: 10000 });
    
    // Wait for the dropdown to have actual staff names (not just empty options)
    await this.page.waitForFunction(() => {
      const coacheeDropdowns = document.querySelectorAll('select[name="coacheeName"]');
      if (coacheeDropdowns.length === 0) return false;
      
      // Check first dropdown for real staff names
      const firstDropdown = coacheeDropdowns[0] as HTMLSelectElement;
      const options = Array.from(firstDropdown.options);
      
      // Filter out empty options and check for actual names
      const validOptions = options.filter(option => 
        option.value.trim() !== '' && 
        option.textContent?.trim() !== '' &&
        !option.textContent?.includes('Loading') &&
        !option.textContent?.includes('TBD')
      );
      
      console.log(`📋 Found ${validOptions.length} valid staff options in coachee dropdown`);
      return validOptions.length > 0;
    }, { timeout: 15000, polling: 1000 });
    
    console.log('✅ Staff names loaded successfully');
    
    // Small buffer to ensure form is fully ready
    await this.page.waitForTimeout(2000);
    
  } catch (error) {
    console.warn('⚠️ Timeout waiting for staff names, proceeding anyway:', error);
    // Continue with form filling even if staff names aren't detected
    await this.page.waitForTimeout(3000);
  }
}

/**
 * Resolve staff IDs to staff names using the existing /api/staff endpoint
 * Simple API call to fetch staff names by IDs
 */
private async resolveStaffNamesFromIds(staffIds: string[]): Promise<string[]> {
  if (!staffIds || staffIds.length === 0) return [];
  
  try {
    // Use filters parameter to find staff by IDs
    const url = new URL('/api/staff', window.location.origin);
    url.searchParams.set('limit', '1000'); // Get enough records
    url.searchParams.set('filters[_id][$in]', JSON.stringify(staffIds));
    
    console.log('Fetching staff names from:', url.toString());
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.warn('Failed to fetch staff names:', response.statusText);
      return staffIds.map(id => `Staff ${id.slice(0, 8)}`);
    }
    
    const data = await response.json();
    console.log('Staff API response:', data);
    
    const staffItems: { _id: string; staffName?: string; label?: string }[] = data.items || [];
    
    // Create a lookup map
    const staffMap = new Map(
      staffItems.map(staff => [staff._id, staff.staffName || staff.label || 'Unknown Staff'])
    );
    
    console.log('Staff lookup map:', staffMap);
    
    // Return names in the same order as input IDs
    const result = staffIds.map(id => 
      staffMap.get(id) || `Unknown Staff (${id.slice(0, 8)})`
    );
    
    console.log('Resolved staff names:', result);
    return result;
    
  } catch (error) {
    console.error('Error fetching staff names:', error);
    return staffIds.map(id => `Staff ${id.slice(0, 8)}`);
  }
}

  private splitMultiPersonEvents(events: EventData[]): EventData[] {
    const splitEvents: EventData[] = [];
    
    events.forEach((event, eventIndex) => {
      if (event.name.length > 1) {
        console.log(`📋 Splitting event ${eventIndex + 1} with ${event.name.length} people`);
        
        // Create separate row for each person
        event.name.forEach(personName => {
          splitEvents.push({
            name: [personName], // Single person per row
            role: event.role,
            activity: event.activity,
            duration: event.duration
          });
        });
      } else {
        splitEvents.push(event);
      }
    });
    
    return splitEvents;
  }

  private async ensureCorrectRowCount(targetCount: number): Promise<void> {
    if (!this.page) return;
    
    console.log(`🔢 Ensuring ${targetCount} coaching session rows...`);
    
    // Wait for initial row
    await this.page.waitForSelector('select[name="coacheeName"]', { timeout: 5000 });
    
    // Add additional rows by clicking "+ Add Row" button
    for (let i = 1; i < targetCount; i++) {
      const addRowButton = this.page.locator('button:has-text("+ Add Row"), button.btn-secondary');
      
      if (await addRowButton.isVisible()) {
        console.log(`➕ Adding row ${i + 1}/${targetCount}`);
        await addRowButton.click();
        await this.page.waitForTimeout(500);
      } else {
        console.warn(`⚠️ Cannot find "+ Add Row" button for row ${i + 1}`);
        break;
      }
    }
    
    // Verify final count
    await this.page.waitForTimeout(1000);
    const actualRows = await this.page.locator('select[name="coacheeName"]').count();
    console.log(`✅ Created ${actualRows} rows (target: ${targetCount})`);
  }

  private async populateSessionRowWithRetry(
    rowIndex: number, 
    session: EventData, 
    maxRetries: number = 3
  ): Promise<void> {
    console.log(`📝 Populating row ${rowIndex + 1}:`, session);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.selectCoachingDropdownWithFallback(rowIndex, "coacheeName", session.name[0]);
        await this.selectCoachingDropdownWithFallback(rowIndex, "coacheeRole", session.role);
        await this.selectCoachingDropdownWithFallback(rowIndex, "coachingActivity", session.activity);
        await this.selectCoachingDropdownWithFallback(rowIndex, "coachingDuration", session.duration);
        
        console.log(`✅ Successfully populated row ${rowIndex + 1}`);
        return;
        
      } catch (error) {
        console.warn(`⚠️ Attempt ${attempt}/${maxRetries} failed for row ${rowIndex + 1}:`, error);
        
        if (attempt === maxRetries) {
          console.error(`❌ Failed to populate row ${rowIndex + 1} after ${maxRetries} attempts`);
          // Use safe fallback values
          await this.populateRowWithFallbacks(rowIndex);
        } else {
          await this.page?.waitForTimeout(1000);
        }
      }
    }
  }

  private async populateRowWithFallbacks(rowIndex: number): Promise<void> {
    console.log(`🆘 Using fallback values for row ${rowIndex + 1}`);
    
    const fallbacks = [
      { field: 'coacheeName', value: 'Teacher TBD' },
      { field: 'coacheeRole', value: 'Teacher' },
      { field: 'coachingActivity', value: 'Observed instruction' },
      { field: 'coachingDuration', value: '45' }
    ];
    
    for (const { field, value } of fallbacks) {
      try {
        await this.selectCoachingDropdownWithFallback(rowIndex, field, value);
      } catch (error) {
        console.error(`❌ Even fallback failed for ${field}:`, error);
      }
    }
  }

  private async selectCoachingDropdown(
    rowIndex: number, 
    fieldName: string, 
    value: string
  ): Promise<void> {
    if (!this.page) return;

    try {
      console.log(`📝 Selecting '${value}' in '${fieldName}' for row ${rowIndex + 1}`);

      const rowLocator = this.page.locator(`div.row > div.row:has(select[name="coacheeName"])`).nth(rowIndex);

      if (await rowLocator.count() === 0) {
        console.error(`❌ Row ${rowIndex + 1} not found in coaching sessions.`);
        return;
      }

      const dropdown = rowLocator.locator(`select[name="${fieldName}"]`);

      if (await dropdown.count() === 0) {
        console.error(`❌ Dropdown '${fieldName}' not found in row ${rowIndex + 1}.`);
        return;
      }

      await dropdown.selectOption({ label: value });

      const selectedValue = await dropdown.evaluate(el => (el as HTMLSelectElement).value);
      if (selectedValue !== value) {
        console.warn(`⚠️ Selection failed for '${fieldName}' in row ${rowIndex + 1}, retrying...`);
        await dropdown.selectOption({ label: value });
      }

      console.log(`✅ Successfully set '${fieldName}' to '${value}' in row ${rowIndex + 1}`);
    } catch (error) {
      console.error(`❌ Error selecting '${fieldName}' in row ${rowIndex + 1}:`, error);
    }
  }

  private async selectCoachingDropdownWithFallback(
    rowIndex: number, 
    fieldName: string, 
    value: string
  ): Promise<void> {
    if (!this.page) return;

    try {
      const rowLocator = this.page.locator('div.row:has(select[name="coacheeName"])').nth(rowIndex);
      const dropdown = rowLocator.locator(`select[name="${fieldName}"]`);
      
      if (await dropdown.count() === 0) {
        console.error(`❌ Dropdown '${fieldName}' not found in row ${rowIndex + 1}`);
        return;
      }

      // Get available options
      const options = await dropdown.locator('option').allTextContents();
      const validOptions = options.filter(opt => opt.trim() !== '');
      
      console.log(`📋 Row ${rowIndex + 1} ${fieldName}: trying '${value}' from ${validOptions.length} options`);
      
      // Try exact match first
      if (validOptions.includes(value)) {
        await dropdown.selectOption({ label: value });
        console.log(`✅ Exact match: '${value}'`);
        return;
      }
      
      // Smart fallback selection
      const fallbackValue = this.getSmartFallback(value, validOptions, fieldName);
      
      if (fallbackValue) {
        await dropdown.selectOption({ label: fallbackValue });
        console.log(`🔄 FALLBACK: Selected '${fallbackValue}' instead of '${value}'`);
      } else {
        console.error(`❌ No suitable fallback found for '${value}' in '${fieldName}'`);
      }

    } catch (error) {
      console.error(`❌ Error selecting '${fieldName}' in row ${rowIndex + 1}:`, error);
    }
  }

  private getSmartFallback(
    preferredValue: string, 
    availableOptions: string[], 
    fieldName: string
  ): string {
    // Field-specific fallback strategies
    const fieldStrategies: Record<string, (preferred: string, options: string[]) => string> = {
      'coacheeName': (preferred, options) => {
        // For names, try contains match or use first option
        return options.find(opt => 
          opt.toLowerCase().includes(preferred.toLowerCase())
        ) || options[0];
      },
      
      'coacheeRole': (preferred, options) => {
        // Role hierarchy fallback
        const roleHierarchy = ['Teacher', 'Coach', 'Principal', 'Administrator'];
        return roleHierarchy.find(role => options.includes(role)) || options[0];
      },
      
      'coachingActivity': (preferred, options) => {
        // Activity semantic matching
        const activityKeywords: Record<string, string[]> = {
          'observation': ['observed', 'watch', 'monitor'],
          'teaching': ['model', 'teach', 'demonstrate'],
          'planning': ['plan', 'prepare'],
          'feedback': ['feedback', 'debrief']
        };
        
        const preferred_lower = preferred.toLowerCase();
        for (const [_category, keywords] of Object.entries(activityKeywords)) {
          if (keywords.some(keyword => preferred_lower.includes(keyword))) {
            const match = options.find(option => 
              keywords.some(keyword => option.toLowerCase().includes(keyword))
            );
            if (match) return match;
          }
        }
        
        // Fallback to first option
        return options[0];
      },
      
      'coachingDuration': (preferred, options) => {
        // Duration numeric matching
        const preferredNum = parseInt(preferred);
        if (!isNaN(preferredNum)) {
          const closest = options
            .map(opt => ({ opt, diff: Math.abs(parseInt(opt) - preferredNum) }))
            .filter(({ diff }) => !isNaN(diff))
            .sort((a, b) => a.diff - b.diff)[0];
          
          return closest ? closest.opt : options[0];
        }
        return options[0];
      }
    };
    
    const strategy = fieldStrategies[fieldName] || ((_, options) => options[0]);
    return strategy(preferredValue, availableOptions);
  }

  private async inputTextValue(fieldName: string, value: string): Promise<void> {
    if (!this.page) return;

    try {
      console.log(`📝 Entering value '${value}' in input field '${fieldName}'`);

      const inputLocator = this.page.locator(`input[name="${fieldName}"], textarea[name="${fieldName}"]`);

      if (await inputLocator.count() === 0) {
        console.error(`❌ Input field '${fieldName}' not found.`);
        return;
      }

      await inputLocator.fill(value);

      // Trigger reactivity
      await this.page.evaluate(({ selector, value }) => {
        const element = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
        if (element) {
          element.value = value;
          element.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }, { selector: `input[name="${fieldName}"], textarea[name="${fieldName}"]`, value });

      console.log(`✅ Successfully entered value '${value}' in '${fieldName}'`);
    } catch (error) {
      console.error(`❌ Error entering value '${value}' in input field '${fieldName}':`, error);
    }
  }

  // NEW: Schema-based text field filling
  private async fillTextFieldsFromSchema(formData: Record<string, string | number | boolean | string[]>): Promise<void> {
    const textFields = [
      'teachersSupportedNumber',
      'microPLTopic', // Direct from schema
      'modelTopic'    // Direct from schema
    ];

    for (const fieldName of textFields) {
      if (formData[fieldName]) {
        await this.inputTextValue(fieldName, formData[fieldName] as string);
      }
    }
  }

  private async fillTextFields(formData: FormData): Promise<void> {
    const textFields = [
      'teachersSupportedNumber',
      'microPLTopic',
      "modelTopic"   
    ];

    for (const fieldName of textFields) {
      if (formData[fieldName]) {
        await this.inputTextValue(fieldName, formData[fieldName] as string);
      } else {
        console.warn(`⚠️ No value found for '${fieldName}', skipping.`);
      }
    }
  }

  // NEW: Schema-based checkbox field filling
  private async fillCheckboxFieldsFromSchema(formData: Record<string, string | number | boolean | string[]>): Promise<void> {
    const checkboxFields = [
      {   
        labelText: "Select all the grade-levels you supported today (Required)*", 
        checkboxName: "NYCSolvesGradeLevels[]",
        value: formData.NYCSolvesGradeLevels || ['6th Grade', '7th Grade', '8th Grade'] // Default to specific grades
      },
      {   
        labelText: "Did you support any of the following teachers during this visit? (Required)*", 
        checkboxName: "teachersSupportedType[]",
        value: formData.teachersSupportedType || ['None of the above']
      }
    ];

    for (const field of checkboxFields) {
      if (field.value) {
        await this.selectCheckboxesFromDropdown(
          field.labelText, 
          field.checkboxName, 
          field.value as string[]
        );
      }
    }
  }

  private async fillCheckboxFields(formData: FormData): Promise<void> {
    const checkboxFields: CheckboxField[] = [
      {   
        labelText: "Select all the grade-levels you supported today (Required)*", 
        checkboxName: "NYCSolvesGradeLevels[]"
      },
      {   
        labelText: "Did you support any of the following teachers during this visit? (Required)*", 
        checkboxName: "teachersSupportedType[]", 
        input: ["Special Education Teachers", "English as New Language or English Language Learner Teachers"]
      }
    ];

    for (const field of checkboxFields) {
      const { labelText, checkboxName, input } = field;
      if (formData[checkboxName] || input) {
        await this.selectCheckboxesFromDropdown(
          labelText, 
          checkboxName, 
          input ? input : formData[checkboxName] as string[]
        );
      } else {
        console.warn(`⚠️ No value found for '${labelText}', skipping.`);
      }
    }
  }

  // ✅ REMOVED: This method was causing duplicate field filling
  // Strategy fields are now handled by fillRemainingStrategyFields() to avoid conflicts

  private async fillMultipleDropdowns(selectors: string[], formData: FormData): Promise<void> {
    try {
      console.log("🔹 Selecting values for multiple dropdowns...", selectors);
      
      for (const selector of selectors) {
        console.log(`🔍 Processing '${selector}' with value: '${formData[selector]}'...`);
        if (selector && formData[selector]) {
          await this.selectAllDropdowns(selector, formData[selector] as string, []);
        } else {
          console.error(`❌ Error filling selector ${selector} with value: ${formData[selector]}`);
        }
      }

      console.log("✅ Successfully selected values for all specified dropdowns.");
    } catch (error) {
      console.error("❌ Error filling dropdowns:", error);
    }
  }

  private showNotification(): void {
    // Browser notification (if supported)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Scraper Done!', {
          body: '✅ The Playwright scraper has finished running.',
        });
      }
    }
    console.log('✅ Form filling completed - ready for manual review');
  }

  /**
   * Monitor for submit button click and handle post-submission cleanup
   */
  async waitForSubmissionAndCleanup(visitId?: string): Promise<void> {
    if (!this.page) return;

    try {
      console.log('👁️ Monitoring for Submit button click...');
      
      // Show user instructions
      await this.showSubmissionBanner();
      
      // Wait for submit button to be clicked manually
      await this.page.evaluate(() => {
        return new Promise<void>((resolve) => {
          const button = document.querySelector('button.submitButton[type="submit"]') as HTMLButtonElement;
          if (button) {
            button.addEventListener('click', () => {
              console.log('🎯 Submit button clicked!');
              resolve();
            }, { once: true });
          }
        });
      });

      console.log('✅ Submit detected - processing cleanup...');
      
      // Update visit record if provided
      if (visitId) {
        await this.updateVisitSubmissionStatus(visitId);
      }
      
      // Brief delay for user feedback
      await this.page.waitForTimeout(2000);
      
    } catch (error) {
      console.error('❌ Error monitoring submission:', error);
    } finally {
      // await this.close();
    }
  }

  private async showVisitInfoSideBanner(visitData: {
    date?: string;
    timeBlocks: VisitScheduleBlock[];
    schoolName: string;
    coachName: string;
  }): Promise<void> {
    if (!this.page) return;
    
    // STEP 1: Log original data received
    console.log('🔍 STEP 1 - Original visitData received:', {
      date: visitData.date,
      schoolName: visitData.schoolName,
      coachName: visitData.coachName,
      timeBlocksCount: visitData.timeBlocks?.length || 0,
      timeBlocksRaw: visitData.timeBlocks
    });
    
    // STEP 2: Log each time block before processing
    if (visitData.timeBlocks && visitData.timeBlocks.length > 0) {
      console.log('🔍 STEP 2 - Individual time blocks:');
      visitData.timeBlocks.forEach((block, index) => {
        console.log(`  Block ${index}:`, {
          periodNumber: block?.periodNumber,
          periodName: block?.periodName,
          startTime: block?.startTime,
          endTime: block?.endTime,
          eventType: block?.eventType,
          portion: block?.portion,
          staffIds: block?.staffIds,
          staffIdsLength: Array.isArray(block?.staffIds) ? block.staffIds.length : 'NOT_ARRAY',
          notes: block?.notes,
          fullObject: block
        });
      });
    } else {
      console.log('🔍 STEP 2 - No time blocks or empty array');
    }
    
    // STEP 3: Process and log safe data with async staff name resolution
    const processedTimeBlocks = await Promise.all(
      (visitData.timeBlocks || []).map(async (block, index) => {
        // NEW: Resolve staff names from IDs using API call
        const staffNames = await this.resolveStaffNamesFromIds(block?.staffIds || []);
        
        const processed = {
          originalIndex: index,
          periodNumber: block?.periodNumber,
          periodName: block?.periodName,
          startTime: block?.startTime,
          endTime: block?.endTime,
          eventType: block?.eventType,
          portion: block?.portion,
          staffIds: block?.staffIds,
          staffNames: staffNames, // NEW: Add resolved staff names
          notes: block?.notes,
          
          // Processed display values
          periodDisplay: `${block?.periodNumber || '?'}${block?.periodName ? ` (${block.periodName})` : ''}`,
          timeDisplay: `${block?.startTime || '?'}-${block?.endTime || '?'}`,
          eventDisplay: `${block?.eventType || 'Unknown'}${block?.portion ? ` (${block.portion})` : ''}`,
          staffCount: Array.isArray(block?.staffIds) ? block.staffIds.length : 0,
          
          // Keep original values for tooltips
          fullPeriod: `${block?.periodNumber || '?'}${block?.periodName ? ` (${block.periodName})` : ''}`,
          fullEvent: `${block?.eventType || 'Unknown'}${block?.portion ? ` (${block.portion})` : ''}`
        };
        
        console.log(`🔍 STEP 3 - Processed block ${index}:`, processed);
        return processed;
      })
    );

    const safeData = {
      date: visitData.date || '',
      schoolName: visitData.schoolName || 'Unknown School',
      coachName: visitData.coachName || 'Unknown Coach',
      timeBlocks: processedTimeBlocks
    };
    
    console.log('🔍 STEP 4 - Final safe data for browser:', {
      timeBlocksCount: safeData.timeBlocks.length,
      schoolName: safeData.schoolName,
      coachName: safeData.coachName,
      fullSafeData: safeData
    });
    
    await this.page.evaluate((data) => {
      // STEP 5: Log data received in browser context
      console.log('🔍 STEP 5 - Browser received data:', {
        hasData: !!data,
        timeBlocksCount: data?.timeBlocks?.length || 0,
        schoolName: data?.schoolName,
        coachName: data?.coachName,
        firstTimeBlock: data?.timeBlocks?.[0] || 'NO_BLOCKS',
        fullData: data
      });
      
      // Remove existing banner if present
      const existingBanner = document.getElementById('visit-info-banner');
      if (existingBanner) existingBanner.remove();
      
      const banner = document.createElement('div');
      banner.id = 'visit-info-banner';
      banner.style.cssText = `
        position: fixed; 
        top: 60px; 
        right: 20px; 
        width: 380px;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 9999;
        background: #fefce8;
        border: 1px solid #eab308;
        border-radius: 8px;
        padding: 12px;
        font-family: system-ui;
        font-size: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        opacity: 1 !important;
      `;
      
      // Add debug info section at top
      const debugInfo = document.createElement('div');
      debugInfo.style.cssText = `
        background: #fef3c7;
        border: 1px solid #f59e0b;
        border-radius: 4px;
        padding: 6px;
        margin-bottom: 8px;
        font-size: 10px;
        color: #92400e;
        opacity: 1 !important;
      `;
      debugInfo.innerHTML = `
        <strong>Debug Info:</strong><br>
        Time Blocks: ${data?.timeBlocks?.length || 0}<br>
        School: ${data?.schoolName || 'Missing'}<br>
        Coach: ${data?.coachName || 'Missing'}<br>
        Date: ${data?.date || 'Missing'}
      `;
      // banner.appendChild(debugInfo);
      
      const formatDate = (dateStr: string) => {
        try {
          return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        } catch {
          return dateStr || 'No date';
        }
      };
      
      // Create collapsible header
      const header = document.createElement('div');
      header.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        background: rgba(234, 179, 8, 0.1);
        opacity: 1 !important;
      `;
      
      const title = document.createElement('h5');
      title.style.cssText = `
        margin: 0;
        font-weight: 600;
        color: #a16207;
        font-size: 13px;
      `;
      title.textContent = '📅 Visit Schedule';
      
      const toggleBtn = document.createElement('span');
      toggleBtn.style.cssText = `
        color: #a16207;
        font-weight: bold;
        font-size: 14px;
        user-select: none;
      `;
      toggleBtn.textContent = '−';
      
      header.appendChild(title);
      header.appendChild(toggleBtn);
      
      // Create content container
      const content = document.createElement('div');
      content.id = 'visit-content';
      content.style.cssText = `
        color: #a16207;
        line-height: 1.4;
        opacity: 1 !important;
      `;
      
      // Visit metadata
      const metadata = document.createElement('div');
      metadata.style.cssText = `
        background: rgba(234, 179, 8, 0.1);
        padding: 8px;
        border-radius: 4px;
        margin-bottom: 8px;
        opacity: 1 !important;
      `;
      metadata.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 4px;">📍 ${data.schoolName}</div>
        <div style="margin-bottom: 2px;">🗓️ ${formatDate(data.date)}</div>
        <div>👨‍🏫 ${data.coachName}</div>
      `;
      
      // Time blocks table - now using safe data with debugging
      if (data.timeBlocks && data.timeBlocks.length > 0) {
        console.log('🔍 STEP 6 - Processing time blocks in browser:', data.timeBlocks);
        
        const blocksTitle = document.createElement('div');
        blocksTitle.style.cssText = `
          font-weight: 600;
          margin-bottom: 6px;
          color: #a16207;
        `;
        blocksTitle.textContent = `⏰ Time Blocks (${data.timeBlocks.length})`;
        
        const blocksContainer = document.createElement('div');
        blocksContainer.style.cssText = `
          background: rgba(234, 179, 8, 0.1);
          border-radius: 4px;
          padding: 6px;
          max-height: 300px;
          overflow-y: auto;
          opacity: 1 !important;
        `;
        
        // Create mini table for time blocks with responsive columns
        const table = document.createElement('table');
        table.style.cssText = `
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
          table-layout: fixed;
        `;
        
        // Table header with flexible column widths
        const thead = document.createElement('thead');
        thead.innerHTML = `
          <tr style="background: rgba(234, 179, 8, 0.2);">
            <th style="padding: 3px 2px; text-align: left; font-weight: 600; width: 20%;">Period</th>
            <th style="padding: 3px 2px; text-align: left; font-weight: 600; width: 25%;">Time</th>
            <th style="padding: 3px 2px; text-align: left; font-weight: 600; width: 25%;">Event</th>
            <th style="padding: 3px 2px; text-align: left; font-weight: 600; width: 30%;">Staff Names</th>
          </tr>
        `;
        
        // Table body with improved staff name display and text wrapping
        const tbody = document.createElement('tbody');
        data.timeBlocks.forEach((block, index) => {
          console.log(`🔍 STEP 7 - Browser processing block ${index}:`, {
            block: block,
            periodDisplay: block?.periodDisplay,
            timeDisplay: block?.timeDisplay,
            eventDisplay: block?.eventDisplay,
            staffNames: block?.staffNames,
            staffCount: block?.staffCount
          });
          
          const row = document.createElement('tr');
          row.style.cssText = `
            border-bottom: 1px solid rgba(234, 179, 8, 0.2);
            ${index % 2 === 0 ? 'background: rgba(234, 179, 8, 0.05);' : ''}
          `;
          
          // Use staff names instead of IDs, with proper fallbacks
          const periodDisplay = block?.periodDisplay || `P${block?.periodNumber || '?'}`;
          const timeDisplay = block?.timeDisplay || `${block?.startTime || '?'}-${block?.endTime || '?'}`;
          const eventDisplay = block?.eventDisplay || block?.eventType || 'Unknown';
          
          // NEW: Display actual staff names with line breaks for readability
          let staffDisplay = 'No staff';
          if (block?.staffNames && Array.isArray(block.staffNames) && block.staffNames.length > 0) {
            // Join names with line breaks for better readability
            staffDisplay = block.staffNames.join('<br>');
          } else if (block?.staffCount > 0) {
            staffDisplay = `${block.staffCount} staff`;
          }
          
          row.innerHTML = `
            <td style="padding: 2px 1px; word-wrap: break-word; overflow-wrap: break-word;" title="${block?.fullPeriod || periodDisplay}">${periodDisplay}</td>
            <td style="padding: 2px 1px; word-wrap: break-word; overflow-wrap: break-word;" title="${timeDisplay}">${timeDisplay}</td>
            <td style="padding: 2px 1px; word-wrap: break-word; overflow-wrap: break-word;" title="${block?.fullEvent || eventDisplay}">${eventDisplay}</td>
            <td style="padding: 2px 1px; word-wrap: break-word; overflow-wrap: break-word; line-height: 1.2;" title="Staff assigned to this time block">${staffDisplay}</td>
          `;
          
          tbody.appendChild(row);
        });
        
        table.appendChild(thead);
        table.appendChild(tbody);
        blocksContainer.appendChild(table);
        
        content.appendChild(blocksTitle);
        content.appendChild(blocksContainer);
        
        // Add summary info
        const summaryDiv = document.createElement('div');
        summaryDiv.style.cssText = `
          margin-top: 6px;
          padding: 4px 6px;
          background: rgba(234, 179, 8, 0.1);
          border-radius: 4px;
          font-size: 10px;
          text-align: center;
          opacity: 1 !important;
        `;
        
        const totalStaff = data.timeBlocks.reduce((sum, block) => {
          if (block?.staffNames && Array.isArray(block.staffNames)) {
            return sum + block.staffNames.length;
          }
          return sum + (block?.staffCount || 0);
        }, 0);
        
        const uniqueEventTypes = [...new Set(
          data.timeBlocks.map(block => block?.eventDisplay?.split(' (')[0] || 'Unknown')
        )];
        
        summaryDiv.innerHTML = `
          📊 ${totalStaff} total staff interactions<br>
          🎯 Events: ${uniqueEventTypes.join(', ')}
        `;
        
        content.appendChild(summaryDiv);
        
      } else {
        console.log('🔍 STEP 6 - No time blocks to process in browser');
        const noBlocks = document.createElement('div');
        noBlocks.style.cssText = `
          text-align: center;
          padding: 12px;
          color: #a16207;
          font-style: italic;
          background: rgba(234, 179, 8, 0.1);
          border-radius: 4px;
          opacity: 1 !important;
        `;
        noBlocks.textContent = 'No time blocks scheduled';
        content.appendChild(noBlocks);
      }
      
      content.insertBefore(metadata, content.firstChild);
      
      // Toggle functionality
      let isCollapsed = false;
      header.addEventListener('click', () => {
        isCollapsed = !isCollapsed;
        if (isCollapsed) {
          content.style.display = 'none';
          toggleBtn.textContent = '+';
          banner.style.width = '300px';
        } else {
          content.style.display = 'block';
          toggleBtn.textContent = '−';
          banner.style.width = '380px';
        }
      });
      
      // Close button
      const closeBtn = document.createElement('button');
      closeBtn.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        color: #a16207;
        font-size: 16px;
        cursor: pointer;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        opacity: 1 !important;
      `;
      closeBtn.innerHTML = '×';
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        banner.remove();
      });
      
      banner.appendChild(closeBtn);
      banner.appendChild(header);
      banner.appendChild(content);
      document.body.appendChild(banner);
      
      // Remove auto-hide opacity change - keep banner fully opaque
      // The original code had an auto-hide after 45 seconds that made it transparent
      // We're removing this behavior as requested
      
    }, safeData);
  }

  private async showSubmissionBanner(): Promise<void> {
    if (!this.page) return;
    
    await this.page.evaluate(() => {
      const banner = document.createElement('div');
      banner.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; z-index: 10000;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white; padding: 12px; text-align: center;
        font-family: system-ui; font-size: 14px; font-weight: 500;
      `;
      banner.innerHTML = `
        ✅ Form ready! Please review data and click Submit when ready. 👆
      `;
      document.body.insertBefore(banner, document.body.firstChild);
      
      // Highlight submit button
      const submitButton = document.querySelector('button.submitButton[type="submit"]') as HTMLElement;
      if (submitButton) {
        setTimeout(() => {
          // submitButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // submitButton.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
        }, 1000);
      }
    });
  }

  private async updateVisitSubmissionStatus(visitId: string): Promise<void> {
    try {
      console.log(`📝 Marking visit ${visitId} coaching log as submitted`);
      
      const { updateVisit } = await import('@actions/visits/visits');
      const result = await updateVisit(visitId, { coachingLogSubmitted: true });
      
      if (result.success) {
        console.log('✅ Visit record updated successfully');
      } else {
        console.error('❌ Failed to update visit record:', result.error);
      }
    } catch (error) {
      console.error('❌ Error updating visit record:', error);
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      // await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

// Export types for use in other files
export type { FormFieldEntry, EventData, AutomationResult };