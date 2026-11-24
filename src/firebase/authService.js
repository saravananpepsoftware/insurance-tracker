import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from './config.js';

export const ADMINS_COLLECTION = 'admins';

export const DEFAULT_ADMIN = {
  id: 'admin_ashokinsurance',
  email: 'ashokinsurance@gmail.com',
  password: 'Ashok@123',
  name: 'Ashok Insurance Admin',
  role: 'admin'
};

/**
 * Initializes and ensures the default admin exists in the Firestore 'admins' collection
 */
export async function seedDefaultAdmin() {
  try {
    const adminDocRef = doc(db, ADMINS_COLLECTION, DEFAULT_ADMIN.id);
    const docSnap = await getDoc(adminDocRef);

    if (!docSnap.exists()) {
      await setDoc(adminDocRef, {
        email: DEFAULT_ADMIN.email,
        password: DEFAULT_ADMIN.password,
        name: DEFAULT_ADMIN.name,
        role: DEFAULT_ADMIN.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null
      });
      console.log('Default admin seeded successfully in Firestore admins collection.');
    }
    return true;
  } catch (error) {
    console.error('Error seeding default admin in Firestore:', error);
    return false;
  }
}

/**
 * Validates admin credentials against the 'admins' Firestore collection
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
 */
export async function loginAdmin(email, password) {
  try {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!normalizedEmail || !cleanPassword) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    // Ensure default admin exists if user is logging in with default credentials
    await seedDefaultAdmin();

    // Query admins collection by email
    const adminsRef = collection(db, ADMINS_COLLECTION);
    const q = query(adminsRef, where('email', '==', normalizedEmail));
    const querySnapshot = await getDocs(q);

    let matchedDoc = null;
    let adminData = null;

    if (!querySnapshot.empty) {
      matchedDoc = querySnapshot.docs[0];
      adminData = matchedDoc.data();
    } else {
      // Fallback: check direct document by ID if email matches default
      const directDocRef = doc(db, ADMINS_COLLECTION, DEFAULT_ADMIN.id);
      const directSnap = await getDoc(directDocRef);
      if (directSnap.exists() && directSnap.data().email.toLowerCase() === normalizedEmail) {
        matchedDoc = directSnap;
        adminData = directSnap.data();
      }
    }

    if (!matchedDoc || !adminData) {
      return {
        success: false,
        error: 'No administrator account found with this email address.'
      };
    }

    // Check password
    if (adminData.password !== cleanPassword) {
      return {
        success: false,
        error: 'Incorrect password. Please verify your credentials and try again.'
      };
    }

    // Update last login timestamp in Firestore
    try {
      await updateDoc(doc(db, ADMINS_COLLECTION, matchedDoc.id), {
        lastLogin: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Could not update lastLogin in Firestore:', e);
    }

    const authenticatedUser = {
      id: matchedDoc.id,
      email: adminData.email,
      name: adminData.name || 'Ashok Insurance Admin',
      role: adminData.role || 'admin',
      lastLogin: new Date().toISOString()
    };

    return {
      success: true,
      user: authenticatedUser
    };
  } catch (error) {
    console.error('Error during admin login:', error);

    // Fallback: If offline or network error, verify against default admin if matches
    if (
      email.trim().toLowerCase() === DEFAULT_ADMIN.email.toLowerCase() &&
      password.trim() === DEFAULT_ADMIN.password
    ) {
      return {
        success: true,
        user: {
          id: DEFAULT_ADMIN.id,
          email: DEFAULT_ADMIN.email,
          name: DEFAULT_ADMIN.name,
          role: DEFAULT_ADMIN.role,
          lastLogin: new Date().toISOString()
        }
      };
    }

    return {
      success: false,
      error: error.message || 'Authentication failed. Please check network connection.'
    };
  }
}
