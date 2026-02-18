import { Page } from "playwright";
import { UnitData, TargetSkill, SkillReference } from "./types";

/**
 * Extract skill title and ID from text like "Understand Exponents (265)"
 */
function parseSkillText(text: string): { title: string; skillNumber: string } {
  const match = text.match(/^(.+?)\s*\((\d+)\)$/);
  if (match) {
    return {
      title: match[1].trim(),
      skillNumber: match[2],
    };
  }
  return {
    title: text.trim(),
    skillNumber: "",
  };
}

import { Locator } from "playwright";

/**
 * Extract skills from a support skills section (Essential or Helpful)
 */
async function extractSkillsFromSection(
  accordionContent: Locator,
  sectionHeading: string,
): Promise<SkillReference[]> {
  const skills: SkillReference[] = [];

  try {
    // Find the section by heading text within the accordion content
    const section = accordionContent
      .locator(`h4:has-text("${sectionHeading}")`)
      .locator("..");

    // Check for "No available options" message
    const emptyMessage = await section
      .locator(".p-dataview-emptymessage")
      .count();
    if (emptyMessage > 0) {
      console.log(`  ℹ️  ${sectionHeading}: No available options`);
      return skills;
    }

    // Get all skill buttons
    const skillButtons = await section.locator("button.p-button-link").all();

    for (const button of skillButtons) {
      const text = await button.textContent();
      if (text) {
        const { title, skillNumber } = parseSkillText(text);
        skills.push({ title, skillNumber });
      }
    }

    console.log(`  ✅ ${sectionHeading}: Found ${skills.length} skills`);
  } catch (error) {
    console.error(`  ❌ Error extracting ${sectionHeading}:`, error);
  }

  return skills;
}

/**
 * Main function to scrape unit page data
 */
export async function extractUnitData(
  page: Page,
  url: string,
  unitNameFromDropdown?: string,
): Promise<UnitData> {
  console.log("📖 Starting unit data extraction...");

  // Use the full unit name from dropdown (includes number) or fallback to scraping h1
  const unitTitle =
    unitNameFromDropdown ||
    (await page.locator("#unitSkillCounts h1").textContent()) ||
    "";
  console.log(`📚 Unit Title: ${unitTitle}`);

  // Extract counts
  const targetCountText =
    (await page.locator(".target h3").textContent()) || "0";
  const supportCountText =
    (await page.locator(".support h3").textContent()) || "0";
  const extensionCountText =
    (await page.locator(".extension h3").textContent()) || "0";

  const targetCount = parseInt(targetCountText.match(/(\d+)/)?.[1] || "0");
  const supportCount = parseInt(supportCountText.match(/(\d+)/)?.[1] || "0");
  const extensionCount = parseInt(
    extensionCountText.match(/(\d+)/)?.[1] || "0",
  );

  console.log(
    `📊 Counts - Target: ${targetCount}, Support: ${supportCount}, Extension: ${extensionCount}`,
  );

  // Get all accordion tabs
  const accordionSelector = ".p-accordion .p-accordion-tab";
  await page.waitForSelector(accordionSelector);
  const accordionTabs = await page.locator(accordionSelector).all();

  console.log(`📂 Found ${accordionTabs.length} accordion tabs`);

  const targetSkills: TargetSkill[] = [];
  const additionalSupportSkills: SkillReference[] = [];
  const extensionSkills: SkillReference[] = [];

  for (let i = 0; i < accordionTabs.length; i++) {
    const tab = accordionTabs[i];

    // Get the header to determine type
    const header = tab.locator(".p-accordion-header");
    const headerClasses = (await header.getAttribute("class")) || "";

    // Determine skill type from classes
    const isTargetSkill = headerClasses.includes("nc_unit-target-skill");
    const isAdditionalSupport = headerClasses.includes(
      "nc_unit-additional-support-skill",
    );
    const isExtension = headerClasses.includes("nc_unit-extension-skill");

    if (isTargetSkill) {
      // Extract target skill title and ID from header
      const titleElement = await header.locator("h3").textContent();
      if (!titleElement) continue;

      const { title, skillNumber } = parseSkillText(titleElement);
      console.log(
        `\n🎯 Processing Target Skill ${i}: ${title} (${skillNumber})`,
      );

      // Click to open the accordion
      const headerLink = header.locator("a.p-accordion-header-link");
      await headerLink.click();

      // Wait for animation
      await page.waitForTimeout(500);

      // Get the accordion content (the sibling element after the header)
      const accordionContent = tab.locator(".p-toggleable-content");

      // Extract Essential Skills
      const essentialSkills = await extractSkillsFromSection(
        accordionContent,
        "Essential Skill(s)",
      );

      // Extract Helpful Skills
      const helpfulSkills = await extractSkillsFromSection(
        accordionContent,
        "Helpful Skill(s)",
      );

      targetSkills.push({
        title,
        skillNumber,
        essentialSkills,
        helpfulSkills,
      });

      // Close accordion (optional, for cleanliness)
      await headerLink.click();
      await page.waitForTimeout(300);
    } else if (isAdditionalSupport) {
      console.log(`\n🛠️  Processing Additional Support Skills section`);

      // Click to open
      const headerLink = header.locator("a.p-accordion-header-link");
      await headerLink.click();
      await page.waitForTimeout(500);

      // Get the accordion content
      const accordionContent = tab.locator(".p-toggleable-content");

      // Get all skill buttons in this section
      const skillButtons = await accordionContent
        .locator("button.p-button-link")
        .all();

      for (const button of skillButtons) {
        const text = await button.textContent();
        if (text) {
          const { title, skillNumber } = parseSkillText(text);
          additionalSupportSkills.push({ title, skillNumber });
        }
      }

      console.log(
        `  ✅ Found ${additionalSupportSkills.length} additional support skills`,
      );

      await headerLink.click();
      await page.waitForTimeout(300);
    } else if (isExtension) {
      console.log(`\n🚀 Processing Extension Skills section`);

      // Click to open
      const headerLink = header.locator("a.p-accordion-header-link");
      await headerLink.click();
      await page.waitForTimeout(500);

      // Get the accordion content
      const accordionContent = tab.locator(".p-toggleable-content");

      // Get all skill buttons in this section
      const skillButtons = await accordionContent
        .locator("button.p-button-link")
        .all();

      for (const button of skillButtons) {
        const text = await button.textContent();
        if (text) {
          const { title, skillNumber } = parseSkillText(text);
          extensionSkills.push({ title, skillNumber });
        }
      }

      console.log(`  ✅ Found ${extensionSkills.length} extension skills`);

      await headerLink.click();
      await page.waitForTimeout(300);
    }
  }

  console.log(`\n✅ Extraction complete!`);
  console.log(`   Target Skills: ${targetSkills.length}`);
  console.log(`   Additional Support: ${additionalSupportSkills.length}`);
  console.log(`   Extension: ${extensionSkills.length}`);

  return {
    unitTitle,
    url,
    targetCount,
    supportCount,
    extensionCount,
    targetSkills,
    additionalSupportSkills,
    extensionSkills,
    scrapedAt: new Date().toISOString(),
    success: true,
  };
}
