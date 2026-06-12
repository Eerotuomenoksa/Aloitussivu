import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAdditionalUserInfo,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import {
  getToken,
  initializeAppCheck,
  ReCaptchaV3Provider,
  type AppCheck,
} from 'firebase/app-check';

export const ADMIN_EMAIL = 'eero.tuomenoksa@gmail.com';
const ADMIN_EMAILS = [
  ADMIN_EMAIL,
  'seniorsurf.suomi@gmail.com',
];
const ADMIN_EMAIL_STORAGE_KEY = 'seniorSurfGoogleAdminEmail';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
};
const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY?.trim();

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey
  && firebaseConfig.authDomain
  && firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let appCheck: AppCheck | null = null;

type StoredAdminEmail = {
  uid: string;
  email: string;
};

type GoogleProfile = {
  email?: unknown;
};

const readStoredAdminEmail = (user: User | null) => {
  if (!user || typeof window === 'undefined') return '';

  try {
    const value = window.localStorage.getItem(ADMIN_EMAIL_STORAGE_KEY);
    if (!value) return '';
    const parsed = JSON.parse(value) as Partial<StoredAdminEmail>;
    if (parsed.uid !== user.uid || typeof parsed.email !== 'string') return '';
    return parsed.email;
  } catch {
    return '';
  }
};

const storeAdminEmail = (uid: string, email: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ADMIN_EMAIL_STORAGE_KEY, JSON.stringify({ uid, email }));
};

const getApp = () => {
  if (!isFirebaseConfigured) return null;
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
};

const ensureAppCheck = (initializedApp: FirebaseApp) => {
  if (!appCheckSiteKey || typeof window === 'undefined') return null;
  if (!appCheck) {
    try {
      appCheck = initializeAppCheck(initializedApp, {
        provider: new ReCaptchaV3Provider(appCheckSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch {
      return null;
    }
  }
  return appCheck;
};

export const getFirebaseAuth = () => {
  const initializedApp = getApp();
  if (!initializedApp) return null;
  if (!auth) {
    auth = getAuth(initializedApp);
  }
  return auth;
};

export const getFirebaseDb = () => {
  const initializedApp = getApp();
  if (!initializedApp) return null;
  ensureAppCheck(initializedApp);
  if (!db) {
    db = getFirestore(initializedApp);
  }
  return db;
};

export const getFirebaseAppCheckToken = async () => {
  const initializedApp = getApp();
  if (!initializedApp || !appCheckSiteKey || typeof window === 'undefined') return '';

  const initializedAppCheck = ensureAppCheck(initializedApp);
  if (!initializedAppCheck) return '';

  const token = await getToken(initializedAppCheck, false);
  return token.token;
};

export const getUserEmail = (user: User | null) => (
  user?.email
  || user?.providerData.find((provider) => provider.email)?.email
  || readStoredAdminEmail(user)
  || ''
);

const getTrustedUserEmail = (user: User | null) => (
  user?.email
  || user?.providerData.find((provider) => provider.email)?.email
  || ''
);

export const isAdminUser = (user: User | null) => ADMIN_EMAILS.includes(getTrustedUserEmail(user).toLocaleLowerCase('fi-FI'));

export const getUserAuthDebugInfo = (user: User | null) => {
  if (!user) return '';
  const providerIds = user.providerData.map((provider) => provider.providerId).join(', ') || 'ei provider-tietoja';
  const emailSources = [
    user.email ? 'user.email' : '',
    user.providerData.some((provider) => provider.email) ? 'providerData.email' : '',
    readStoredAdminEmail(user) ? 'popup-profile.email' : '',
  ].filter(Boolean).join(', ') || 'ei sähköpostilähdettä';
  return `UID: ${user.uid}. Providerit: ${providerIds}. Sähköpostin lähde: ${emailSources}.`;
};

const createGoogleProvider = (withPrompt: boolean) => {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');

  if (withPrompt) {
    provider.setCustomParameters({
      login_hint: ADMIN_EMAIL,
      prompt: 'select_account',
    });
  }

  return provider;
};

export const signInWithGoogle = async () => {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error('Firebase ei ole määritetty.');
  }

  let result;
  try {
    result = await signInWithPopup(firebaseAuth, createGoogleProvider(true));
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error
      ? (error as { code?: unknown }).code
      : '';
    if (code !== 'auth/internal-error') throw error;
    result = await signInWithPopup(firebaseAuth, createGoogleProvider(false));
  }

  const profile = getAdditionalUserInfo(result)?.profile as GoogleProfile | null | undefined;
  if (typeof profile?.email === 'string') {
    storeAdminEmail(result.user.uid, profile.email);
  }
  return result;
};

export const signOutAdmin = async () => {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) return;
  await signOut(firebaseAuth);
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(firebaseAuth, callback);
};
