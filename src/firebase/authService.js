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
export const STAFF_COLLECTION = 'staff';

export const DEFAULT_ADMIN = {
  id: 'admin_ashokinsurance',
  email: 'ashokinsurance@gmail.com',
  password: 'Ashok@123',
  name: 'Ashok Insurance Admin',
  role: 'admin'
};

export const DEFAULT_STAFF = {
  id: 'staff_default',
  email: 'staff@gmail.com',
  password: 'Staff@123',
  name: 'Ashok Insurance Staff',
  role: 'staff'
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
 * Initializes and ensures the default staff exists in the Firestore 'staff' collection
 */
export async function seedDefaultStaff() {
  try {
    const staffDocRef = doc(db, STAFF_COLLECTION, DEFAULT_STAFF.id);
    const docSnap = await getDoc(staffDocRef);

    if (!docSnap.exists()) {
      await setDoc(staffDocRef, {
        email: DEFAULT_STAFF.email,
        password: DEFAULT_STAFF.password,
        name: DEFAULT_STAFF.name,
        role: DEFAULT_STAFF.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null
      });
      console.log('Default staff seeded successfully in Firestore staff collection.');
    }
    return true;
  } catch (error) {
    console.error('Error seeding default staff in Firestore:', error);
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
      if (directSnap.exists() && directSnap.data().email?.toLowerCase() === normalizedEmail) {
        matchedDoc = directSnap;
        adminData = directSnap.data();
      }
    }

    if (!matchedDoc || !adminData) {
      // Friendly check: did the user enter a staff email in the admin portal?
      if (normalizedEmail === DEFAULT_STAFF.email.toLowerCase()) {
        return {
          success: false,
          error: 'This email belongs to a Staff account. Please switch to the "Staff Portal" tab to sign in.'
        };
      }
      return {
        success: false,
        error: 'No administrator account found with this email in the admin collection.'
      };
    }

    // Check password
    if (adminData.password !== cleanPassword) {
      return {
        success: false,
        error: 'Incorrect admin password. Please verify your credentials and try again.'
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
      role: 'admin',
      portal: 'admin',
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
          role: 'admin',
          portal: 'admin',
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

/**
 * Validates staff credentials against the separate 'staff' Firestore collection
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
 */
export async function loginStaff(email, password) {
  try {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!normalizedEmail || !cleanPassword) {
      return { success: false, error: 'Please enter both staff email and password.' };
    }

    // Ensure default staff exists in the staff Firestore collection
    await seedDefaultStaff();

    // Query staff collection by email
    const staffRef = collection(db, STAFF_COLLECTION);
    const q = query(staffRef, where('email', '==', normalizedEmail));
    const querySnapshot = await getDocs(q);

    let matchedDoc = null;
    let staffData = null;

    if (!querySnapshot.empty) {
      matchedDoc = querySnapshot.docs[0];
      staffData = matchedDoc.data();
    } else {
      // Fallback: check direct document by ID if email matches default
      const directDocRef = doc(db, STAFF_COLLECTION, DEFAULT_STAFF.id);
      const directSnap = await getDoc(directDocRef);
      if (directSnap.exists() && directSnap.data().email?.toLowerCase() === normalizedEmail) {
        matchedDoc = directSnap;
        staffData = directSnap.data();
      }
    }

    if (!matchedDoc || !staffData) {
      // Friendly check: did the user enter an admin email in the staff portal?
      if (normalizedEmail === DEFAULT_ADMIN.email.toLowerCase()) {
        return {
          success: false,
          error: 'This email belongs to an Admin account. Please switch to the "Admin Portal" tab to sign in.'
        };
      }
      return {
        success: false,
        error: 'No staff account found with this email in the staff collection.'
      };
    }

    // Check password
    if (staffData.password !== cleanPassword) {
      return {
        success: false,
        error: 'Incorrect staff password. Please verify your credentials and try again.'
      };
    }

    // Update last login timestamp in Firestore
    try {
      await updateDoc(doc(db, STAFF_COLLECTION, matchedDoc.id), {
        lastLogin: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Could not update lastLogin in Firestore:', e);
    }

    const authenticatedUser = {
      id: matchedDoc.id,
      email: staffData.email,
      name: staffData.name || 'Ashok Insurance Staff',
      role: 'staff',
      portal: 'staff',
      lastLogin: new Date().toISOString()
    };

    return {
      success: true,
      user: authenticatedUser
    };
  } catch (error) {
    console.error('Error during staff login:', error);

    // Fallback: If offline or network error, verify against default staff if matches
    if (
      email.trim().toLowerCase() === DEFAULT_STAFF.email.toLowerCase() &&
      password.trim() === DEFAULT_STAFF.password
    ) {
      return {
        success: true,
        user: {
          id: DEFAULT_STAFF.id,
          email: DEFAULT_STAFF.email,
          name: DEFAULT_STAFF.name,
          role: 'staff',
          portal: 'staff',
          lastLogin: new Date().toISOString()
        }
      };
    }

    return {
      success: false,
      error: error.message || 'Staff authentication failed. Please check network connection.'
    };
  }
}

/**
 * Unified login handler supporting both admin and staff portals
 */
export async function loginUser(email, password, portalType = 'admin') {
  if (portalType === 'staff') {
    return loginStaff(email, password);
  }
  return loginAdmin(email, password);
}
