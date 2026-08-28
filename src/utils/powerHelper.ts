/**
 * Utility functions for extracting project power and filtering TE4 checklist categories.
 * 
 * Rules:
 * - If system is On-Grid, batteries are not used / hidden.
 * - If inverter / project capacity is < 8 kW (or strictly < 10 kW), categories for 10-30kW (cat-sec-02) 
 *   and >30kW (cat-sec-03) are omitted/hidden to streamline field work.
 * - If capacity is >= 10 kW and <= 30 kW, category 10-30kW is shown, while >30kW is hidden.
 * - If capacity is > 30 kW, all categories are shown.
 */

import { ChecklistCategory, TechnicalInfo } from '../types';

export function extractNumericPowerKw(technical: TechnicalInfo): number {
  // 1. Try to extract from inverterBrandModel (e.g., "Huawei - SUN2000-8KTL-M1 (8kW Trifásico Híbrido)" or "5 kW")
  const inverterStr = technical.inverterBrandModel || '';
  
  // Patterns like "8kW", "8 kW", "8.5kW", "8 kVA", "8000W", "8000 W", "8KTL", "SUN2000-8KTL"
  const kwMatch = inverterStr.match(/(\d+(?:\.\d+)?)\s*k(?:W|VA)/i);
  if (kwMatch && kwMatch[1]) {
    const val = parseFloat(kwMatch[1]);
    if (!isNaN(val) && val > 0) return val;
  }

  const ktlMatch = inverterStr.match(/(\d+)KTL/i);
  if (ktlMatch && ktlMatch[1]) {
    const val = parseFloat(ktlMatch[1]);
    if (!isNaN(val) && val > 0) return val;
  }

  const wMatch = inverterStr.match(/(\d{4,6})\s*W/i);
  if (wMatch && wMatch[1]) {
    const val = parseFloat(wMatch[1]) / 1000;
    if (!isNaN(val) && val > 0) return val;
  }

  // 2. Try installedPowerKwp
  const rawInstalled = technical.installedPowerKwp || '';
  const numInstalled = parseFloat(rawInstalled.replace(',', '.').replace(/[^\d.]/g, ''));
  if (!isNaN(numInstalled) && numInstalled > 0) {
    return numInstalled;
  }

  // 3. Try to calculate from stringConfigs / panel totals
  if (technical.stringConfigs && technical.stringConfigs.length > 0) {
    const totalWatts = technical.stringConfigs.reduce((acc, c) => acc + ((c.panelsCount || 0) * (c.panelWatts || 550)), 0);
    if (totalWatts > 0) {
      return totalWatts / 1000;
    }
  }

  // Default fallback: 5.5 kW standard residential
  return 5.5;
}

/**
 * Filters the checklist categories according to the inverter / project power.
 * When power is less than 8 kW (or < 10 kW), categories for 10-30kW and >30kW are hidden.
 */
export function getApplicableCategories(categories: ChecklistCategory[], technical: TechnicalInfo): ChecklistCategory[] {
  const powerKw = extractNumericPowerKw(technical);

  // If power is < 8 kW (strictly below 10 kW threshold as requested for small systems)
  if (powerKw < 8 || powerKw < 10) {
    // Only return Category 1 (Domiciliarias 1-12)
    return categories.filter((cat) => cat.id === 'cat-sec-01' || (!cat.id.includes('cat-sec-02') && !cat.id.includes('cat-sec-03')));
  }

  // If power is between 10 kW and 30 kW
  if (powerKw >= 10 && powerKw <= 30) {
    return categories.filter((cat) => cat.id !== 'cat-sec-03');
  }

  // > 30 kW: show all
  return categories;
}
