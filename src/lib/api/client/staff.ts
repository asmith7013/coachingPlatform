/**
 * Client-safe function to check if a staff member exists by email
 * Returns data in the format expected by useErrorHandledMutation
 */
export async function checkStaffExistenceByEmail(email: string) {
  try {
    if (!email) {
      return { 
        success: true, 
        data: { exists: false } 
      };
    }
    
    // Call the API endpoint instead of models directly
    const response = await fetch(`/api/staff/exists?email=${encodeURIComponent(email)}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const apiResponse = await response.json();
    
    // Return in the format expected by useErrorHandledMutation
    return {
      success: true,
      data: { exists: !!apiResponse.exists }
    };
  } catch (error) {
    console.error('Error checking staff existence:', error);
    throw error;
  }
} 