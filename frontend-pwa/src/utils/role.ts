import { UserResource } from '@clerk/types';

export const getUserRole = (user: UserResource | null | undefined): string => {
  if (!user) return 'student';
  
  const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();
  
  // Hardcoded Admin Access
  if (email === 'meghnaravikumar06@gmail.com') {
    return 'admin';
  }
  
  // Hardcoded Driver Access for testing
  if (email?.includes('driver') || email === 'driver@vit.ac.in') {
    return 'driver';
  }
  
  // Faculty Access
  if (email?.includes('faculty')) {
    return 'faculty';
  }

  // Fallback to Clerk Metadata (if configured in Clerk Dashboard) or default to student
  return (user.publicMetadata?.role as string)?.toLowerCase() || 'student';
};
