import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Ensure single Firebase app instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Drive Workspace scopes
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to indicate if we are in the middle of a sign-in flow
let isSigningIn = false;
// Cache the access token in memory
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;

const authListeners: Array<(user: User | null, token: string | null) => void> = [];

function notifyAuthListeners(user: User | null, token: string | null) {
  authListeners.forEach((listener) => {
    try {
      listener(user, token);
    } catch (e) {
      console.warn('Error in auth listener:', e);
    }
  });
}

/**
 * Initializes Firebase Auth state listener safely
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (onAuthSuccess) {
    authListeners.push(onAuthSuccess);
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      cachedUser = user;
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
        notifyAuthListeners(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      cachedUser = null;
      if (onAuthFailure) onAuthFailure();
      notifyAuthListeners(null, null);
    }
  });
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
    cachedUser = result.user;
    notifyAuthListeners(result.user, cachedAccessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    if (error?.code === 'auth/popup-closed-by-user') {
      throw new Error('Ventana de inicio de sesión cerrada por el usuario.');
    }
    if (error?.code === 'auth/popup-blocked') {
      throw new Error('El navegador bloqueó la ventana emergente de inicio de sesión. Por favor permita ventanas emergentes (popups) en la barra del navegador.');
    }
    if (error?.code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
      throw new Error(
        `Dominio temporal no autorizado (${currentHost}). Puedes subir directamente mediante el servidor o usar las opciones avanzadas.`
      );
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Sets a manual Google OAuth Access Token
 */
export const setManualAccessToken = (token: string, email?: string): void => {
  const cleanToken = token.trim();
  cachedAccessToken = cleanToken;
  const userObj = {
    displayName: email || 'Técnico Autorizado',
    email: email || 'te4.servilec@gmail.com',
    uid: 'manual-token-user',
  } as unknown as User;
  cachedUser = userObj;
  notifyAuthListeners(userObj, cleanToken);
};

/**
 * Returns current Google Access Token
 */
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Returns current authenticated user
 */
export const getCurrentUser = (): User | null => {
  return cachedUser || auth.currentUser;
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
  cachedUser = null;
  notifyAuthListeners(null, null);
};
