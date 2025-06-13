// src/lib/server/api/client/endpoints.ts
export const API_ENDPOINTS = {
    cycles: '/api/cycles',
    schools: '/api/schools',
    staff: '/api/staff',
    lookFors: '/api/look-fors',
    visits: '/api/visits'
} as const;

export function getStaffUrl(type?: 'nycps' | 'teachingLab'): string {
    return type ? `${API_ENDPOINTS.staff}?type=${type}` : API_ENDPOINTS.staff;
}