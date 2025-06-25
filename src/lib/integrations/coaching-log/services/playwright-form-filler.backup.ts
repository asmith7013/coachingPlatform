// src/lib/integrations/coaching-log/services/playwright-form-filler.ts

import { chromium, Browser, Page } from 'playwright';
import { CoachingLogInput } from '@zod-schema/visits/coaching-log';
import { 
  getImplementationOptions,
  getPrimaryStrategyOptions 
} from '@ui/constants/coaching-log';
import { fetchVisitScheduleData } from '@actions/visits/visit-schedule-data';
import { visitScheduleToEventData } from '../mappers/visit-schedule-to-events';

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

  async initialize(): Promise<void> {
    console.log('Starting CoachingLogFormFiller...');
    
    this.browser = await chromium.launch({ 
      headless: false
    });

    this.page = await this.browser.newPage();
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
      events?: EventData[];
    }
  ): Promise<AutomationResult> {
    if (!this.page) {
      return { success: false, error: "Browser not initialized. Call initialize() first." };
    }

    try {
      console.log('📝 Filling form from CoachingLog schema data:', coachingLog);

      // Map schema fields directly to form fields
      const formData = this.mapSchemaToFormFields(coachingLog, formOverrides);
      
      // Fill form sections using existing methods
      await this.selectAllDropdowns("CoachingDone", coachingLog.reasonDone, []);
      await this.populateDropdownsFromSchema(formData);
      
      // NEW: Fill contractor-specific fields after basic fields
      await this.populateContractorFields(formData);
      
      await this.fillCheckboxFieldsFromSchema(formData);
      await this.fillTextFieldsFromSchema(formData);
      
      // Handle events if provided (from visit schedule or legacy data)
      const events = formOverrides?.events || [];
      if (events.length > 0) {
        console.log('📅 Populating coaching sessions from events:', events.length);
        await this.populateCoachingSessions(events);
      } else {
        console.log('⚠️ No events provided for coaching sessions');
      }
      
      // Fill strategy dropdowns
      const dropdownsToFill = ['implementationIndicator', 'supportCycle', 'PrimaryStrategy', 'solvesSpecificStrategy'];
      await this.fillMultipleDropdownsFromSchema(dropdownsToFill, formData);

      console.log("✅ Form filled successfully from schema!");
      this.showNotification();

      return { success: true, message: "Form filled successfully from schema - ready for manual review" };
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
      
      // Transform to event data (existing logic unchanged)
      const events = visitScheduleToEventData(
        scheduleData.visitSchedule,
        scheduleData.staffLookup
      );
      
      // Use visit data for additional overrides (existing logic unchanged)
      const enhancedOverrides = {
        ...formOverrides,
        visitDate: scheduleData.visit?.date,
        modeDone: scheduleData.visit?.modeDone,
        events
      };
      
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
        { 
          unique: "Did you deliver a micro PL at this school today?", 
          target: "Names of participants:", 
          name: "microPLParticipants[]", 
          values: ["James Frey", "Michele Patafio", "Cara Garvey"] 
        },
        { 
          unique: "Did you deliver a micro PL at this school today?", 
          target: "Participants were:", 
          name: "microPLParticipantRoles[]", 
          values: ["Teacher"] 
        },
        { 
          unique: "Did you provide coaching, modeling, or planning with a group of teachers at this school today?", 
          target: "Names of participants:", 
          name: "modelParticipants[]", 
          values: ["James Frey", "Michele Patafio"] 
        },
        { 
          unique: "Did you provide coaching, modeling, or planning with a group of teachers at this school today?", 
          target: "Participants were:", 
          name: "modelParticipantRoles[]", 
          values: ["Teacher"] 
        }
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

  // NEW: Direct schema-to-form mapping with smart constants integration
  private mapSchemaToFormFields(
    coachingLog: CoachingLogInput,
    overrides?: {
      schoolName?: string;
      districtName?: string;
      coachName?: string;
      visitDate?: string;     // NEW: from related visit
      modeDone?: string;      // NEW: from related visit
    }
  ): Record<string, string | number | boolean | string[]> {
    
    // Use constants for smart hierarchical field selection
    const implementationExperience = coachingLog.implementationExperience || 'First year of Implementation';
    const primaryStrategyCategory = coachingLog.primaryStrategyCategory || coachingLog.primaryStrategy || 'In-class support';
    
    // Get correct descendant values using existing constants
    const implementationOptions = getImplementationOptions(implementationExperience);
    const strategyOptions = getPrimaryStrategyOptions(primaryStrategyCategory);
    
    return {
      // Direct schema mappings
      reasonDone: coachingLog.reasonDone,
      totalDuration: coachingLog.totalDuration,
      
      // FIX: Use correct form field name with capital 'S' and map value
      Solvestouchpoint: this.mapSolvesTouchpointValue(coachingLog.solvesTouchpoint),
      
      // SMART: Use constants for hierarchical mapping
      implementationIndicator: implementationOptions[0] || 'Doing the Math: Lesson Planning',
      PrimaryStrategy: primaryStrategyCategory,
      solvesSpecificStrategy: strategyOptions[0] || coachingLog.solvesSpecificStrategy || 'Modeling full lesson',
      
      // Optional schema fields
      microPLTopic: coachingLog.microPLTopic || '',
      microPLDuration: coachingLog.microPLDuration?.toString() || '',
      modelTopic: coachingLog.modelTopic || '',
      modelDuration: coachingLog.modelDuration?.toString() || '',
      
      // Travel Duration Fields
      schoolTravelDuration: coachingLog.schoolTravelDuration?.toString() || '76',
      finalTravelDuration: coachingLog.finalTravelDuration?.toString() || '76',
      
      adminMeet: coachingLog.adminMeet ? 'Yes' : 'No',
      adminMeetDuration: coachingLog.adminMeetDuration?.toString() || '',
      NYCDone: this.determineNYCCoachStatus(coachingLog),
      
      // Form-specific overrides
      schoolName: overrides?.schoolName || '',
      districtName: overrides?.districtName || '',
      coachName: overrides?.coachName || 'Coach',
      
            // Visit context from overrides (visit data passed in)
      coachingDate: overrides?.visitDate || new Date().toISOString().split('T')[0],
      modeDone: overrides?.modeDone || 'In-person',
        
      // UPDATED: Use schema values instead of hardcoded
      isContractor: coachingLog.isContractor ? 'Yes' : 'No',  // CHANGED from hardcoded 'Yes'
      teachersSupportedNumber: coachingLog.teachersSupportedNumber?.toString() || '1',
      NYCSolvesGradeLevels: coachingLog.gradeLevelsSupported?.length > 0 
        ? coachingLog.gradeLevelsSupported 
        : ['6th Grade', '7th Grade', '8th Grade'], // Use schema or fallback
      teachersSupportedType: coachingLog.teachersSupportedTypes?.length > 0
        ? coachingLog.teachersSupportedTypes 
        : ['None of the above'] // Use schema or fallback
    };
  }

  // ADD: Ultra-simple fallback helper method
  private getFirstAvailableOption(availableOptions: string[]): string {
    // Filter out empty options and return first valid one
    const validOptions = availableOptions.filter(opt => opt.trim() !== '');
    return validOptions[0] || '';
  }

  // ADD: Simple value mapping method (Fixed: Remove &amp;)
  private mapSolvesTouchpointValue(value: string): string {
    const valueMap: Record<string, string> = {
      'Teacher support': 'Teacher OR teacher & leader support',  // Fixed: Raw &
      'Leader support only': 'Leader support only', 
      'Teacher OR teacher & leader support': 'Teacher OR teacher & leader support'  // Fixed: Raw &
    };
    return valueMap[value] || value;
  }

  // ADD: Determine NYC Coach status from schema data
  private determineNYCCoachStatus(coachingLog: CoachingLogInput): string {
    // If we have SOLVES-specific data, we're a NYC Solves coach
    if (coachingLog.solvesTouchpoint && coachingLog.solvesTouchpoint !== 'No') {
      return 'Yes, NYC Solves';
    }
    
    // If we have implementation experience data, likely NYC Solves
    if (coachingLog.implementationExperience) {
      return 'Yes, NYC Solves';
    }
    
    // If we have primary strategy data, likely NYC Solves  
    if (coachingLog.primaryStrategy || coachingLog.primaryStrategyCategory) {
      return 'Yes, NYC Solves';
    }
    
    // Default to No if no NYC-specific data
    return 'No';
  }

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

    console.log("📅 Selecting date:", dateValue);
    try {
      const datePicker = this.page.locator('input[name="date"]');
      await datePicker.click();

      const dateObj = new Date(`${dateValue}T00:00:00`);
      if (isNaN(dateObj.getTime())) {
        console.error(`❌ Invalid date format: ${dateValue}`);
        return;
      }

      const targetMonth = dateObj.toLocaleString('en-US', { month: 'long' });
      const targetYear = dateObj.getFullYear();
      const targetDay = dateObj.getDate();

      console.log(`🔹 Target Date: ${targetMonth} ${targetDay}, ${targetYear}`);

      // Navigate to correct year
      while (true) {
        const displayedYearLocator = this.page.locator('.react-datepicker__current-month');
        const displayedYearText = await displayedYearLocator.innerText();
        const displayedYear = parseInt(displayedYearText.split(" ")[1]);

        if (displayedYear === targetYear) break;

        if (displayedYear < targetYear) {
          console.log(`🔄 Increasing year: Clicking NEXT arrow`);
          await this.page.locator('.react-datepicker__navigation--next').click();
        } else {
          console.log(`🔄 Decreasing year: Clicking PREV arrow`);
          await this.page.locator('.react-datepicker__navigation--previous').click();
        }
        await this.page.waitForTimeout(500);
      }

      // Navigate to correct month
      while (true) {
        const displayedMonthLocator = this.page.locator('.react-datepicker__current-month');
        const displayedMonthText = await displayedMonthLocator.innerText();
        const displayedMonth = displayedMonthText.split(" ")[0];

        if (displayedMonth === targetMonth) break;

        if (new Date(`${displayedMonth} 1, ${targetYear}`).getMonth() < new Date(`${targetMonth} 1, ${targetYear}`).getMonth()) {
          console.log(`🔄 Moving forward to month: ${targetMonth}`);
          await this.page.locator('.react-datepicker__navigation--next').click();
        } else {
          console.log(`🔄 Moving backward to month: ${targetMonth}`);
          await this.page.locator('.react-datepicker__navigation--previous').click();
        }
        await this.page.waitForTimeout(500);
      }

      // Select the day
      const daySelector = `xpath=//div[contains(@class, 'react-datepicker__day') and not(contains(@class, 'outside-month')) and text()='${targetDay}']`;
      const dayButton = this.page.locator(daySelector);

      if (await dayButton.count() === 0) {
        console.error(`❌ Could not find date: ${targetMonth} ${targetDay}, ${targetYear}`);
        return;
      }

      console.log(`✅ Clicking on date: ${targetMonth} ${targetDay}, ${targetYear}`);
      await dayButton.click();
      await this.page.locator('body').click(); // Click outside to confirm

      console.log(`✅ Successfully selected date: ${targetMonth} ${targetDay}, ${targetYear}`);
    } catch (error) {
      console.error("❌ Error selecting date:", error);
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
  private async populateDropdownsFromSchema(formData: Record<string, string | number | boolean | string[]>): Promise<void> {
    const dropdownFields = [
      "coachName",
      "districtName", 
      "schoolName",
      "modeDone",
      "isContractor",    // This triggers the conditional fields
      "coachingDate",
      "reasonDone",
      "NYCDone",  // Critical: Do this BEFORE other NYC fields
      // REMOVED: Travel duration fields moved to contractor-specific section
    ];

    for (const field of dropdownFields) {
      if (formData[field]) {
        if (field === 'coachingDate') {
          await this.selectDate(formData[field] as string);
        } else {
          await this.selectDropdown(field, formData[field] as string);
          
          // If we just selected contractor status, wait for conditional fields
          if (field === 'isContractor') {
            console.log('⏳ Waiting for contractor-specific fields to appear...');
            await this.page?.waitForTimeout(2000);
          }
          
          // If we just selected NYC Coach status, wait for conditional fields to appear
          if (field === 'NYCDone') {
            console.log('⏳ Waiting for NYC-specific fields to appear...');
            await this.page?.waitForTimeout(2000);
          }
        }
      }
    }

    // Now try the NYC-specific fields that should be visible
    const nycFields = ["Solvestouchpoint", "totalDuration"];
    for (const field of nycFields) {
      if (formData[field]) {
        await this.selectDropdown(field, formData[field] as string);
      }
    }

    // Wait for any remaining conditional fields to appear
    console.log('⏳ Waiting for grade level-dependent fields to appear...');
    await this.page?.waitForTimeout(3000);
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

      for (let i = 0; i < dropdownCount; i++) {
        const options = await dropdowns.nth(i).locator('option').allTextContents();
        console.log(`📋 Available options for '${selector}' dropdown #${i + 1}:`, options);
        
        let finalValue = value;

        // Check for JSON override
        const jsonEntry = jsonData.find(entry => entry.selector === selector && entry.i === i);
        if (jsonEntry && jsonEntry.value) {
          finalValue = jsonEntry.value as string;
          console.log(`🔄 Overriding with JSON data value: '${finalValue}' for '${selector}' dropdown #${i + 1}`);
        }

        console.log(`🎯 Trying to select: '${finalValue}' (from constants) for dropdown #${i + 1}`);
        
        // Try exact match first (value came from constants)
        if (options.includes(finalValue)) {
          await dropdowns.nth(i).selectOption({ label: finalValue });
          console.log(`✅ Selected '${finalValue}' using constants mapping for '${selector}' dropdown #${i + 1}`);
        } else {
          // Simple fallback: just pick first available
          const fallbackValue = this.getFirstAvailableOption(options);
          if (fallbackValue) {
            await dropdowns.nth(i).selectOption({ label: fallbackValue });
            console.log(`🔄 FALLBACK: Selected '${fallbackValue}' (first available) instead of '${finalValue}' for '${selector}' dropdown #${i + 1}`);
          } else {
            console.error(`❌ No valid options available for '${selector}' dropdown #${i + 1}`);
          }
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
      console.log("🔹 Populating Coaching Sessions...");

      const coachingSessions: EventData[] = [];
      
      // Extract coaching sessions from events
      events.forEach(event => {
        if (event.name.length === 1 && event.name[0].trim().split(' ').length > 1) {
          coachingSessions.push({
            name: [event.name[0]], // Wrap in array to match EventData type
            role: event.role,
            activity: event.activity,
            duration: event.duration.toString()
          });
        } 
      });

      console.log(`✅ Coaching Sessions to Populate: ${JSON.stringify(coachingSessions, null, 2)}`);

      // Click "+ Add Row" button for additional sessions
      for (let i = 0; i < coachingSessions.length - 1; i++) {
        const addRowButton = this.page.locator('button.btn-secondary');
        if (await addRowButton.isVisible()) {
          console.log(`✅ Clicking "+ Add Row" button (${i + 1}/${coachingSessions.length - 1})`);
          await addRowButton.click();
          await this.page.waitForTimeout(500);
        }
      }

      await this.page.waitForTimeout(1000);

      const rows = this.page.locator('div.row > div.row:has(select[name="coacheeName"])');

      await this.page.waitForFunction((expectedRows) => {
        return document.querySelectorAll('div.row > div.row select[name="coacheeName"]').length >= expectedRows;
      }, coachingSessions.length);

      const totalRows = await rows.count();
      console.log(`🔎 Total coaching session rows detected: ${totalRows}`);

      if (totalRows < coachingSessions.length) {
        console.error(`❌ Expected ${coachingSessions.length} rows but found only ${totalRows}.`);
        return;
      }

      // Populate each row
      for (let i = 0; i < coachingSessions.length; i++) {
        const session = coachingSessions[i];
        console.log(`📝 Populating Row ${i + 1}/${coachingSessions.length}: ${JSON.stringify(session)}`);

        await this.selectCoachingDropdown(i, "coacheeName", session.name[0]); // Use first name from array
        await this.selectCoachingDropdown(i, "coacheeRole", session.role);
        await this.selectCoachingDropdown(i, "coachingActivity", session.activity);
        await this.selectCoachingDropdown(i, "coachingDuration", session.duration);
      }

      console.log("✅ Coaching sessions populated successfully!");
    } catch (error) {
      console.error("❌ Error populating coaching sessions:", error);
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

  // NEW: Schema-based multiple dropdown filling
  private async fillMultipleDropdownsFromSchema(selectors: string[], formData: Record<string, string | number | boolean | string[]>): Promise<void> {
    for (const selector of selectors) {
      if (formData[selector]) {
        await this.selectAllDropdowns(selector, formData[selector] as string, []);
      }
    }
  }

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

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

// Export types for use in other files
export type { FormFieldEntry, EventData, AutomationResult };