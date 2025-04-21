/**
 * Client-side API functions for fetching data
 */
import { mutate } from 'swr';

type OptionType = {
  value: string;
  label: string;
};

interface ApiResponse<T> {
  items: T[];
  total?: number;
  empty?: boolean;
}

interface School {
  _id: string;
  schoolName: string;
}

interface Staff {
  _id: string;
  staffName: string;
}

/**
 * Fetches school options for select/autocomplete fields
 */
export async function fetchSchoolOptions(q = ""): Promise<OptionType[]> {
  const params = new URLSearchParams();
  
  // Only add search param if q is not empty
  if (q) {
    params.append("search", q);
  }
  
  params.append("limit", "20");
  
  try {
    const res = await fetch(`/api/schools?${params}`);
    
    if (!res.ok) {
      console.error("Error fetching schools:", res.statusText);
      return [];
    }
    
    const data = await res.json() as ApiResponse<School>;

    return data.items.map((school) => ({
      value: school._id,
      label: school.schoolName,
    }));
  } catch (error) {
    console.error("Error fetching school options:", error);
    return [];
  }
}

/**
 * Fetches staff options for select/autocomplete fields
 */
export async function fetchStaffOptions(q = ""): Promise<OptionType[]> {
  const params = new URLSearchParams();
  
  // Only add search param if q is not empty
  if (q) {
    params.append("search", q);
  }
  
  params.append("limit", "20");
  
  try {
    const res = await fetch(`/api/staff?${params}`);
    
    if (!res.ok) {
      console.error("Error fetching staff:", res.statusText);
      return [];
    }
    
    const data = await res.json() as ApiResponse<Staff>;

    return data.items.map((staff) => ({
      value: staff._id,
      label: staff.staffName,
    }));
  } catch (error) {
    console.error("Error fetching staff options:", error);
    return [];
  }
}

/**
 * Invalidate school options cache to refresh data
 */
export function invalidateSchoolOptions() {
  mutate((key: string) => key.startsWith('/api/schools'));
}

/**
 * Invalidate staff options cache to refresh data
 */
export function invalidateStaffOptions() {
  mutate((key: string) => key.startsWith('/api/staff'));
} 