import { UserJSON, OrganizationJSON, DeletedObjectJSON } from '@clerk/nextjs/server';
import { handleUserSync, handleOrganizationSync, handleUserDeletion } from '../handlers/clerk-webhook';

export type MockWebhookData = {
  user: Partial<UserJSON>;
  organization: Partial<OrganizationJSON>;
  deletedUser: Partial<DeletedObjectJSON>;
};

export const mockWebhookData: MockWebhookData = {
  user: {
    id: 'user_123',
    email_addresses: [{
      id: 'email_123',
      email_address: 'test@example.com',
      verification: null,
      linked_to: [],
      object: 'email_address'
    }],
    public_metadata: {
      staffId: 'staff_123',
      staffType: 'nycps',
      roles: ['Teacher'],
      schoolIds: ['school_123']
    },
    object: 'user',
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User',
    image_url: 'https://example.com/avatar.png',
    has_image: true,
    created_at: Date.now(),
    updated_at: Date.now()
  },
  organization: {
    id: 'org_123',
    name: 'Test Organization',
    slug: 'test-org',
    public_metadata: {
      permissions: ['admin'],
      districtId: 'district_123',
      primaryContact: 'contact@example.com',
      subscriptionTier: 'premium'
    },
    object: 'organization',
    created_at: Date.now(),
    updated_at: Date.now(),
    max_allowed_memberships: 10,
    admin_delete_enabled: true
  },
  deletedUser: {
    id: 'user_123',
    deleted: true,
    object: 'user'
  }
};

export async function testUserSync() {
  const result = await handleUserSync(mockWebhookData.user as UserJSON);
  console.log('User sync test result:', result);
  return result;
}

export async function testOrganizationSync() {
  const result = await handleOrganizationSync(mockWebhookData.organization as OrganizationJSON);
  console.log('Organization sync test result:', result);
  return result;
}

export async function testUserDeletion() {
  const result = await handleUserDeletion(mockWebhookData.deletedUser as DeletedObjectJSON);
  console.log('User deletion test result:', result);
  return result;
}

export async function runAllTests() {
  console.log('Running all webhook handler tests...');
  
  try {
    const results = await Promise.all([
      testUserSync(),
      testOrganizationSync(),
      testUserDeletion()
    ]);
    
    console.log('All tests completed:', results);
    return results;
  } catch (error) {
    console.error('Error running tests:', error);
    throw error;
  }
} 