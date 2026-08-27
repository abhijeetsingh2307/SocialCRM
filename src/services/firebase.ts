import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { SocialContact } from '../types';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Connect to named database if specified in config
export const db = firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

// Authentication functions
export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  
  // Update user profile record in Firestore
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLoginAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('Could not update user document', e);
  }

  return user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(onUserChanged: (user: User | null) => void) {
  return onAuthStateChanged(auth, onUserChanged);
}

// Live Cloud Firestore Operations
export function subscribeToUserContacts(
  userId: string,
  onData: (contacts: SocialContact[]) => void,
  onError?: (err: Error) => void
) {
  const contactsRef = collection(db, 'users', userId, 'contacts');
  const q = query(contactsRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const contacts: SocialContact[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as SocialContact;
        contacts.push({
          ...data,
          id: docSnap.id,
        });
      });
      // Sort in memory by updatedAt or createdAt desc
      contacts.sort((a, b) => {
        const tA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const tB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return tB - tA;
      });
      onData(contacts);
    },
    (error) => {
      console.error('Firestore contacts subscription error:', error);
      if (onError) onError(error);
    }
  );
}

export async function saveContactToCloud(userId: string, contact: SocialContact): Promise<void> {
  const contactRef = doc(db, 'users', userId, 'contacts', contact.id);
  const cleanContact = {
    ...contact,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(contactRef, cleanContact, { merge: true });
}

export async function saveBatchContactsToCloud(userId: string, contacts: SocialContact[]): Promise<void> {
  const batch = writeBatch(db);
  contacts.forEach((contact) => {
    const contactRef = doc(db, 'users', userId, 'contacts', contact.id);
    batch.set(contactRef, contact, { merge: true });
  });
  await batch.commit();
}

export async function deleteContactFromCloud(userId: string, contactId: string): Promise<void> {
  const contactRef = doc(db, 'users', userId, 'contacts', contactId);
  await deleteDoc(contactRef);
}

export function subscribeToUserTags(
  userId: string,
  onData: (tags: string[]) => void
) {
  const tagsRef = doc(db, 'users', userId, 'settings', 'tags');
  return onSnapshot(tagsRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (Array.isArray(data?.tags)) {
        onData(data.tags);
      }
    }
  });
}

export async function saveUserTagsToCloud(userId: string, tags: string[]): Promise<void> {
  const tagsRef = doc(db, 'users', userId, 'settings', 'tags');
  await setDoc(tagsRef, { tags, updatedAt: new Date().toISOString() }, { merge: true });
}
