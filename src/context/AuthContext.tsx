import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import {
  loginWithGoogle,
  logoutUser,
  subscribeToAuth,
  subscribeToUserContacts,
  saveContactToCloud,
  deleteContactFromCloud,
  saveBatchContactsToCloud,
  subscribeToUserTags,
  saveUserTagsToCloud,
} from '../services/firebase';
import { SocialContact } from '../types';
import { getStoredContacts, saveStoredContacts, getStoredCustomTags, saveStoredCustomTags } from '../services/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isCloudSyncing: boolean;
  cloudSyncError: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  syncLocalToCloud: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        // Auto-broadcast session to Chrome Extension storage bridge
        try {
          window.localStorage.setItem('social_crm_user_session', JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            timestamp: Date.now()
          }));
          window.dispatchEvent(new CustomEvent('social_crm_auth_broadcast', {
            detail: { uid: firebaseUser.uid, email: firebaseUser.email }
          }));
        } catch (e) {
          // ignore
        }
      } else {
        window.localStorage.removeItem('social_crm_user_session');
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      setCloudSyncError(null);
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      // Don't treat user closed popup as error
      if (err?.code !== 'auth/popup-closed-by-user') {
        setCloudSyncError(err?.message || 'Failed to sign in with Google');
      }
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (err: any) {
      console.error('Sign-out failed:', err);
    }
  };

  const syncLocalToCloud = async () => {
    if (!user) return;
    try {
      setIsCloudSyncing(true);
      const localContacts = getStoredContacts();
      if (localContacts.length > 0) {
        await saveBatchContactsToCloud(user.uid, localContacts);
      }
      const localTags = getStoredCustomTags();
      if (localTags.length > 0) {
        await saveUserTagsToCloud(user.uid, localTags);
      }
    } catch (err: any) {
      console.error('Failed to sync local data to cloud', err);
      setCloudSyncError(err?.message || 'Failed to sync local data');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isCloudSyncing,
        cloudSyncError,
        login,
        logout,
        syncLocalToCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
