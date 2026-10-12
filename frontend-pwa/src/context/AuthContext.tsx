import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  firstName: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'student' | 'driver' | 'faculty' | 'admin';
  registrationNumber?: string;
  facultyId?: string;
  subscriptionType?: string;
  route?: string;
  imageUrl: string;
}

interface AuthContextType {
  user: UserProfile | null;
  login: (identifier: string, pass: string) => boolean;
  signup: (data: any) => boolean;
  logout: () => void;
  simulateRole?: (role: 'student' | 'faculty' | 'driver' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('busmate_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (identifier: string, pass: string) => {
    // Hardcoded Admin Account
    if (identifier.toLowerCase() === 'meghnaravikumar06@gmail.com' && pass === 'admin123') {
      const adminProfile: UserProfile = {
        id: 'admin-001',
        firstName: 'Meghna',
        fullName: 'Meghna Ravikumar',
        email: 'meghnaravikumar06@gmail.com',
        role: 'admin',
        imageUrl: `https://ui-avatars.com/api/?name=Meghna+Ravikumar&background=D82C2C&color=fff&bold=true&rounded=true&size=128`,
      };
      setUser(adminProfile);
      localStorage.setItem('busmate_auth_user', JSON.stringify(adminProfile));
      return true;
    }

    // Normal Users
    const users = JSON.parse(localStorage.getItem('busmate_users') || '[]');
    const found = users.find((u: any) => (u.email === identifier || u.phone === identifier) && u.password === pass);
    if (found) {
      const profile = { ...found };
      delete profile.password;
      // Upgrade avatar if using old dicebear avataaars
      if (!profile.imageUrl || profile.imageUrl.includes('avataaars')) {
        const nameParam = encodeURIComponent(profile.fullName || profile.firstName || 'User');
        profile.imageUrl = `https://ui-avatars.com/api/?name=${nameParam}&background=0F172A&color=fff&bold=true&rounded=true&size=128`;
      }
      setUser(profile);
      localStorage.setItem('busmate_auth_user', JSON.stringify(profile));
      return true;
    }
    return false;
  };

  const signup = (data: any) => {
    const users = JSON.parse(localStorage.getItem('busmate_users') || '[]');
    if (users.find((u: any) => u.email === data.email)) {
      return false; // Email exists
    }
    
    const nameParam = encodeURIComponent(data.fullName || data.firstName || 'User');
    const newUser = {
      ...data,
      id: Math.random().toString(36).substring(2, 9),
      imageUrl: `https://ui-avatars.com/api/?name=${nameParam}&background=0F172A&color=fff&bold=true&rounded=true&size=128`,
    };
    
    users.push(newUser);
    localStorage.setItem('busmate_users', JSON.stringify(users));
    
    const profile = { ...newUser };
    delete profile.password;
    setUser(profile);
    localStorage.setItem('busmate_auth_user', JSON.stringify(profile));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('busmate_auth_user');
  };

  const simulateRole = (role: 'student' | 'faculty' | 'driver' | 'admin') => {
    if (user && user.role === 'admin') {
      const simulatedUser = { ...user, role };
      setUser(simulatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, simulateRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Clerk Replacements
export const useUser = () => {
  const { user } = useAuth();
  if (!user) return { user: null };
  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      fullName: user.fullName,
      imageUrl: user.imageUrl,
      primaryEmailAddress: { emailAddress: user.email },
      publicMetadata: { role: user.role }
    }
  };
};

export const SignedIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : null;
};

export const SignedOut: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return !user ? <>{children}</> : null;
};

export const UserButton: React.FC<{ afterSignOutUrl?: string }> = () => {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <button 
      onClick={() => {
        logout();
        window.location.href = '/';
      }}
      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors border border-slate-600"
    >
      <img src={user.imageUrl} alt="Avatar" className="w-6 h-6 rounded-full" />
      <span className="text-xs font-bold text-slate-200">Logout</span>
    </button>
  );
};
