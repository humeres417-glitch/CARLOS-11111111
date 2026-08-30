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
// Add required Google Drive and user info scopes
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.setCustomParameters({
  prompt: 'select_account',
});

let cachedAccessToken: string | null = null;
let cachedUser: any = null;
let isSigningIn = false;
const authListeners: Array<(user: any, token: string | null) => void> = [];

function notifyAuthListeners(user: any, token: string | null) {
  authListeners.forEach((listener) => {
    try {
      listener(user, token);
    } catch (e) {
      console.warn('Error in auth listener:', e);
    }
  });
}

/**
 * Ensures Google Identity Services (GSI) script is loaded
 */
export const ensureGsiLoaded = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).google?.accounts?.oauth2?.initTokenClient) {
      return resolve(true);
    }

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if ((window as any).google?.accounts?.oauth2?.initTokenClient) {
          clearInterval(interval);
          resolve(true);
        } else if (attempts > 30) {
          clearInterval(interval);
          resolve(false);
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if ((window as any).google?.accounts?.oauth2?.initTokenClient) {
          clearInterval(interval);
          resolve(true);
        } else if (attempts > 20) {
          clearInterval(interval);
          resolve(false);
        }
      }, 100);
    };
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

/**
 * Executes Google Identity Services (GSI) Token Client flow
 */
export const signInWithGSI = async (): Promise<{ user: any; accessToken: string }> => {
  await ensureGsiLoaded();
  const googleObj = (window as any).google;

  if (!googleObj?.accounts?.oauth2?.initTokenClient) {
    throw new Error('Google Identity Services (GSI) no está disponible en el navegador.');
  }

  const clientId = (firebaseConfig as any).oAuthClientId || '599947811375-g7fobqgdq48gee6qvqgba68ag8259rqu.apps.googleusercontent.com';

  return new Promise((resolve, reject) => {
    try {
      const tokenClient = googleObj.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        prompt: 'select_account',
        callback: async (response: any) => {
          if (response.error) {
            console.warn('GSI Token error:', response);
            return reject(new Error(response.error_description || response.error || 'Cancelado o error en Google Identity'));
          }

          const token = response.access_token;
          if (!token) {
            return reject(new Error('No se recibió token de acceso de Google.'));
          }

          cachedAccessToken = token;
          try {
            sessionStorage.setItem('te4_gdrive_access_token', token);
            localStorage.setItem('te4_google_access_token', token);
          } catch (e) {}

          let userObj: any = {
            displayName: 'Usuario Google Drive',
            email: 'te4.servilec@gmail.com',
            photoURL: '',
            uid: 'gsi-user',
          };

          try {
            const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (userRes.ok) {
              const uData = await userRes.json();
              userObj = {
                displayName: uData.name || uData.email,
                email: uData.email || 'te4.servilec@gmail.com',
                photoURL: uData.picture || '',
                uid: uData.sub || 'gsi-user',
              };
              try {
                sessionStorage.setItem('te4_gdrive_user_info', JSON.stringify(userObj));
              } catch (e) {}
            }
          } catch (e) {
            console.warn('Userinfo fetch error:', e);
          }

          cachedUser = userObj;
          notifyAuthListeners(userObj, token);
          resolve({ user: userObj, accessToken: token });
        },
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err: any) {
      reject(err);
    }
  });
};

/**
 * Initializes Auth state listener safely (supporting both Firebase Auth and GSI cached token)
 */
export const initAuth = (
  onAuthSuccess?: (user: any, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  if (onAuthSuccess) {
    authListeners.push(onAuthSuccess);
  }

  // Check stored GSI / Session token first
  try {
    let storedToken = sessionStorage.getItem('te4_gdrive_access_token') || localStorage.getItem('te4_google_access_token');
    const storedUserStr = sessionStorage.getItem('te4_gdrive_user_info');
    if (storedToken) {
      cachedAccessToken = storedToken;
      if (storedUserStr) {
        try {
          cachedUser = JSON.parse(storedUserStr);
        } catch (e) {}
      }
      if (!cachedUser) {
        cachedUser = {
          displayName: 'Usuario Google Drive',
          email: 'te4.servilec@gmail.com',
          uid: 'saved-user',
        };
      }
      if (onAuthSuccess) onAuthSuccess(cachedUser, cachedAccessToken);
    }
  } catch (e) {
    console.warn('[Storage Access Warning]:', e);
  }

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
            cachedUser = user;
            if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
          } else if (!cachedAccessToken) {
            cachedUser = null;
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
 * Executes Google Sign-In with smart fallback:
 * 1. Tries Google Identity Services (GSI) Token Client directly (bypasses authorized-domain restrictions)
 * 2. If GSI unavailable, tries Firebase Auth popup
 * 3. Handles auth/unauthorized-domain with clean fallback and actionable instructions
 */
export const googleSignIn = async (): Promise<{ user: any; accessToken: string }> => {
  isSigningIn = true;

  // 1. Try Firebase Auth popup first (officially integrated with provisioned OAuth credentials)
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google. Reintente el inicio de sesión.');
    }

    cachedAccessToken = credential.accessToken;
    cachedUser = result.user;
    try {
      sessionStorage.setItem('te4_gdrive_access_token', cachedAccessToken);
      localStorage.setItem('te4_google_access_token', cachedAccessToken);
    } catch (e) {
      console.warn('sessionStorage setItem warning:', e);
    }

    notifyAuthListeners(result.user, cachedAccessToken);
    isSigningIn = false;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (firebaseErr: any) {
    console.warn('Firebase Popup error, attempting GSI Token Client fallback:', firebaseErr);
    
    // 2. Try GSI Token Client as alternative
    try {
      const gsiResult = await signInWithGSI();
      isSigningIn = false;
      return gsiResult;
    } catch (gsiErr: any) {
      console.warn('GSI fallback also failed:', gsiErr);
    }

    const currentHost = window.location.hostname;
    if (firebaseErr?.code === 'auth/unauthorized-domain' || firebaseErr?.message?.includes('unauthorized-domain')) {
      throw new Error(
        `Dominio no autorizado en Firebase (${currentHost}). Puedes presionar "Subir a Google Drive" directamente o utilizar un token de acceso en las Opciones avanzadas.`
      );
    }
    throw firebaseErr;
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
  };
  cachedUser = userObj;

  try {
    sessionStorage.setItem('te4_gdrive_access_token', cleanToken);
    localStorage.setItem('te4_google_access_token', cleanToken);
    sessionStorage.setItem('te4_gdrive_user_info', JSON.stringify(userObj));
  } catch (e) {}

  notifyAuthListeners(userObj, cleanToken);
};

/**
 * Returns current Google Access Token
 */
export const getAccessToken = (): string | null => {
  try {
    return cachedAccessToken || sessionStorage.getItem('te4_gdrive_access_token') || localStorage.getItem('te4_google_access_token');
  } catch (e) {
    return cachedAccessToken;
  }
};

/**
 * Returns current authenticated user (Firebase or GSI)
 */
export const getCurrentUser = (): any | null => {
  return cachedUser || auth.currentUser;
};

/**
 * Signs out from Firebase Auth and GSI
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
    sessionStorage.removeItem('te4_gdrive_access_token');
    localStorage.removeItem('te4_google_access_token');
    sessionStorage.removeItem('te4_gdrive_user_info');
  } catch (e) {}
  notifyAuthListeners(null, null);
};

