// NYCPSStaff form overrides
export const NYCPSStaffOverrides = {
  schools: {
    type: 'reference',
    url: '/api/reference/schools',
    multiple: true,
  },
  owners: {
    type: 'reference',
    url: '/api/reference/staff',
    multiple: true,
  },
}; 