import { UserProfile } from '../context/AuthContext';

export const getUserRole = (user: UserProfile | null | undefined): string => {
  return user?.role || 'student';
};
