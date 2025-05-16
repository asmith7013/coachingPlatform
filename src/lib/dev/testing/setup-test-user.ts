import { clerkClient } from '@clerk/nextjs/server';
import { User } from '@clerk/nextjs/server';

export async function setupTestUser(email: string, role: string = 'Director') {
  try {
    // Find user by email
    const clerk = await clerkClient();
    const response = await clerk.users.getUserList({
      emailAddress: [email]
    });
    
    const users = response.data;
    if (!users || users.length === 0) {
      console.error('User not found:', email);
      return;
    }
    
    const user = users[0];
    
    // Set up metadata for testing
    await clerk.users.updateUserMetadata(user.id, {
      publicMetadata: {
        staffId: 'test_staff_' + user.id,
        staffType: 'teachinglab',
        roles: [role],
        permissions: [
          'dashboard.view',
          'dashboard.admin',
          'schools.view',
          'schools.create',
          'schools.edit',
          'staff.view',
          'staff.create',
          'staff.edit'
        ],
        schoolIds: [],
        onboardingCompleted: true
      }
    });
    
    console.log('Test user setup complete:', email);
  } catch (error) {
    console.error('Failed to setup test user:', error);
  }
} 