import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  setPersistence,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Ensure single Firebase app instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth with browserLocalPersistence (localStorage)
// This explicitly prevents the Android Chrome IndexedDB "Database is closing/hidden" error
let authInstance: ReturnType<typeof getAuth>;
try {
  authInstance = initializeAuth(app, {
    persistence: [browserLocalPersistence, browserSessionPersistence, inMemoryPersistence],
  });
} catch {
  authInstance = getAuth(app);
}

export const auth = authInstance;

const provider = new GoogleAuthProvider();
// Request Google Drive Workspace scopes (Least-privilege per-file access)
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.setCustomParameters({
  login_hint: 'te4.servilec@gmail.com',
  prompt: 'select_account',
});

// Flag to indicate if we are in the middle of a sign-in flow
let isSigningIn = false;
// Cache the access token in memory, localStorage and sessionStorage
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;

const STORAGE_TOKEN_KEY = 'te4_google_access_token_v2';
const STORAGE_USER_KEY = 'te4_google_user_v2';

try {
  if (typeof window !== 'undefined') {
    const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY) || sessionStorage.getItem(STORAGE_TOKEN_KEY) || sessionStorage.getItem('te4_google_access_token');
    if (savedToken) cachedAccessToken = savedToken;

    const savedUserJson = localStorage.getItem(STORAGE_USER_KEY);
    if (savedUserJson) {
      cachedUser = JSON.parse(savedUserJson);
    }
  }
} catch {
  // Ignore storage errors
}

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
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify({
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            uid: user.uid
          }));
        }
      } catch {}

      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
        notifyAuthListeners(user, cachedAccessToken);
      } else {
        notifyAuthListeners(user, null);
      }
    } else {
      if (!cachedAccessToken) {
        cachedUser = null;
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_TOKEN_KEY);
            localStorage.removeItem(STORAGE_USER_KEY);
            sessionStorage.removeItem(STORAGE_TOKEN_KEY);
            sessionStorage.removeItem('te4_google_access_token');
          }
        } catch {}
        if (onAuthFailure) onAuthFailure();
        notifyAuthListeners(null, null);
      }
    }
  });
};

/**
 * Requests OAuth Token using Google Identity Services (GIS)
 * Extremely reliable on Android/iOS mobile Chrome without IndexedDB errors
 */
export const requestGoogleIdentityToken = (): Promise<{ user: User; accessToken: string }> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('GIS_NOT_AVAILABLE'));
    }

    const googleObj = (window as any).google;
    if (!googleObj?.accounts?.oauth2) {
      return reject(new Error('GIS_NOT_LOADED'));
    }

    try {
      const tokenClient = googleObj.accounts.oauth2.initTokenClient({
        client_id: (firebaseConfig as any).oAuthClientId || '599947811375-g7fobqgdq48gee6qvqgba68ag8259rqu.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/drive.file openid email profile',
        hint: 'te4.servilec@gmail.com',
        prompt: 'select_account',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            console.warn('GIS Token Error:', tokenResponse);
            return reject(new Error(tokenResponse.error_description || tokenResponse.error));
          }
          if (!tokenResponse.access_token) {
            return reject(new Error('No se recibió token de acceso de Google.'));
          }

          const accessToken = tokenResponse.access_token;
          cachedAccessToken = accessToken;

          // Fetch user profile from Google UserInfo endpoint
          let userObj: any = {
            displayName: 'Carlos Alberto Humeres',
            email: 'te4.servilec@gmail.com',
            uid: 'google-oauth-user',
          };

          try {
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (userInfoRes.ok) {
              const userInfo = await userInfoRes.json();
              userObj = {
                displayName: userInfo.name || userInfo.email || 'Carlos Alberto Humeres',
                email: userInfo.email || 'te4.servilec@gmail.com',
                photoURL: userInfo.picture,
                uid: userInfo.sub || 'google-oauth-user',
              };
            }
          } catch (e) {
            console.warn('Could not fetch Google user profile:', e);
          }

          cachedUser = userObj as User;

          try {
            localStorage.setItem(STORAGE_TOKEN_KEY, accessToken);
            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userObj));
            sessionStorage.setItem(STORAGE_TOKEN_KEY, accessToken);
          } catch {}

          notifyAuthListeners(cachedUser, cachedAccessToken);
          resolve({ user: cachedUser, accessToken: cachedAccessToken });
        },
      });

      tokenClient.requestAccessToken();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Executes Google Sign-In with Google Drive scopes and robust mobile error handling
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  isSigningIn = true;

  // 1. Try Google Identity Services first (immune to Android Chrome IndexedDB issues)
  try {
    const gisResult = await requestGoogleIdentityToken();
    if (gisResult?.accessToken) {
      isSigningIn = false;
      return gisResult;
    }
  } catch (gisErr: any) {
    console.warn('Google Identity Services note (trying Firebase Auth fallback):', gisErr?.message || gisErr);
    if (gisErr?.message?.includes('user_cancel') || gisErr?.message?.includes('closed')) {
      isSigningIn = false;
      throw new Error('Ventana de inicio de sesión cerrada por el usuario.');
    }
  }

  // 2. Fallback to Firebase Auth
  try {
    // Ensure persistence is set before popup
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch {
      // Fallback
    }

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google. Reintente el inicio de sesión.');
    }

    cachedAccessToken = credential.accessToken;
    cachedUser = result.user;

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_TOKEN_KEY, credential.accessToken);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify({
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          uid: result.user.uid
        }));
        sessionStorage.setItem(STORAGE_TOKEN_KEY, credential.accessToken);
      }
    } catch {}

    notifyAuthListeners(result.user, cachedAccessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    const errorMsg = error?.message || String(error);

    if (error?.code === 'auth/popup-closed-by-user') {
      throw new Error('Ventana de inicio de sesión cerrada por el usuario.');
    }
    if (error?.code === 'auth/popup-blocked') {
      throw new Error('El navegador de su móvil bloqueó la ventana emergente. Por favor pulse "Permitir siempre ventanas emergentes" en la barra superior de Chrome.');
    }
    if (errorMsg.toLowerCase().includes('database is closing') || errorMsg.toLowerCase().includes('closing/hidden')) {
      throw new Error('El navegador móvil cerró la conexión temporalmente. Por favor pulse nuevamente "Conectar Google" con la pantalla activa.');
    }
    if (error?.code === 'auth/unauthorized-domain' || errorMsg.includes('unauthorized-domain')) {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
      throw new Error(
        `Dominio temporal no autorizado (${currentHost}). Puedes subir usando las opciones avanzadas.`
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
    displayName: email || 'Técnico Servilec',
    email: email || 'te4.servilec@gmail.com',
    uid: 'manual-token-user',
  } as unknown as User;
  cachedUser = userObj;

  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_TOKEN_KEY, cleanToken);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify({
        displayName: userObj.displayName,
        email: userObj.email,
        uid: userObj.uid
      }));
    }
  } catch {}

  notifyAuthListeners(userObj, cleanToken);
};

/**
 * Returns current Google Access Token
 */
export const getAccessToken = (): string | null => {
  if (cachedAccessToken) return cachedAccessToken;
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_TOKEN_KEY) || sessionStorage.getItem(STORAGE_TOKEN_KEY) || null;
    }
  } catch {}
  return null;
};

/**
 * Returns current authenticated user
 */
export const getCurrentUser = (): User | null => {
  if (cachedUser) return cachedUser;
  if (auth.currentUser) return auth.currentUser;
  try {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem(STORAGE_USER_KEY);
      if (savedUser) return JSON.parse(savedUser);
    }
  } catch {}
  return null;
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
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
      sessionStorage.removeItem(STORAGE_TOKEN_KEY);
      sessionStorage.removeItem('te4_google_access_token');
    }
  } catch {}
  notifyAuthListeners(null, null);
};
