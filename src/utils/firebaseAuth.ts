import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut, setPersistence, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Ensure single Firebase app instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure safe persistence fallback so IndexedDB connection closing in background does not crash Auth
try {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('[Firebase Auth] Fallback to inMemory persistence due to IndexedDB closing/hidden:', err);
    setPersistence(auth, inMemoryPersistence).catch(() => {});
  });
} catch (e) {
  console.warn('[Firebase Auth] Persistence setup caught:', e);
}

const provider = new GoogleAuthProvider();
// Add required Google Drive scope
provider.addScope('https://www.googleapis.com/auth/drive');
provider.setCustomParameters({
  prompt: 'select_account',
});

let cachedAccessToken: string | null = null;
let isSigningIn = false;

/**
 * Initializes Firebase Auth state listener safely
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  try {
    return onAuthStateChanged(
      auth,
      async (user: User | null) => {
        try {
          if (user) {
            let storedToken: string | null = null;
            try {
              storedToken = sessionStorage.getItem('te4_gdrive_access_token');
            } catch (e) {
              console.warn('[SessionStorage] Access error ignored:', e);
            }
            if (storedToken) {
              cachedAccessToken = storedToken;
            }
            if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
          } else {
            cachedAccessToken = null;
            try {
              sessionStorage.removeItem('te4_gdrive_access_token');
            } catch (e) {}
            if (onAuthFailure) onAuthFailure();
          }
        } catch (err) {
          console.warn('[Auth State Change Handling Error Ignored]:', err);
        }
      },
      (error) => {
        console.warn('[Auth State Observer Error Ignored]:', error);
      }
    );
  } catch (err) {
    console.warn('[Init Auth Error Ignored]:', err);
    return () => {};
  }
};

/**
 * Executes Google Sign-In popup with Google Drive scopes
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google. Reintente el inicio de sesión.');
    }

    cachedAccessToken = credential.accessToken;
    try {
      sessionStorage.setItem('te4_gdrive_access_token', cachedAccessToken);
    } catch (e) {
      console.warn('sessionStorage setItem warning:', e);
    }

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Returns current Google Access Token
 */
export const getAccessToken = (): string | null => {
  try {
    return cachedAccessToken || sessionStorage.getItem('te4_gdrive_access_token');
  } catch (e) {
    return cachedAccessToken;
  }
};

/**
 * Signs out from Firebase Auth
 */
export const logoutGoogle = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Signout warning:', e);
  }
  cachedAccessToken = null;
  try {
    sessionStorage.removeItem('te4_gdrive_access_token');
  } catch (e) {}
};

