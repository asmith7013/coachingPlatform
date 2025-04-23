export const NYCPSStaffOverrides = {
  schools: {
    type: 'reference',
    label: 'Schools',
    url: '/api/reference/schools',
    multiple: true,
  },
  owners: {
    type: 'reference',
    label: 'Owners',
    url: '/api/reference/staff',
    multiple: true,
  },
}; 