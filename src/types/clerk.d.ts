export interface UserPublicMetadata {
  roles?: string[];
  permissions?: string[];
  role?: string;
  schoolId?: string;
}

export interface OrganizationPublicMetadata {
  permissions?: string[];
}

declare global {
  // interface UserPublicMetadata extends UserPublicMetadata {}
  // interface OrganizationPublicMetadata extends OrganizationPublicMetadata {}
}
