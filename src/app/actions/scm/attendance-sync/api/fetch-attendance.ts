"use server";

// =====================================
// FETCH ATTENDANCE DATA FROM PODSIE
// =====================================

/**
 * Fetch attendance data from Podsie API for a specific group/section
 *
 * This endpoint returns a matrix of attendance data for all students in the group
 * from the specified start date until today.
 */
export async function fetchPodsieAttendance(
  groupId: string,
  startDate: string
): Promise<unknown> {
  const token = process.env.PODSIE_API_TOKEN;

  if (!token) {
    throw new Error("PODSIE_API_TOKEN not configured");
  }

  // POST method with startDate as query parameter
  const response = await fetch(
    `https://www.podsie.org/api/external/mastery-checks-passed/${groupId}?startDate=${startDate}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Podsie API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return data;
}
