/**
 * Validates a time string in HH:MM format
 * @param time - The time string to validate
 * @returns Boolean indicating if the time is valid
 */
export const validateTime = (time: string): boolean => {
  // Basic time validation (HH:MM format or H:MM format)
  const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(time);
}; 