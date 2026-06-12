import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  OAuthProvider,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { firebaseAuth, firebaseReady, firebaseUnavailableMessage } from './firebaseClient';

const LAST_AUTH_USER_KEY = 'anvara.auth.lastUser.v1';
const NONCE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._';

function requireFirebaseAuth() {
  if (!firebaseReady || !firebaseAuth) {
    throw new Error(firebaseUnavailableMessage() || 'Firebase Auth is not configured.');
  }
  return firebaseAuth;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function makeNonce(size = 32) {
  const bytes = Crypto.getRandomBytes(size);
  return Array.from(bytes, (byte) => NONCE_CHARS[byte % NONCE_CHARS.length]).join('');
}

export function subscribeAuthState(callback) {
  if (!firebaseReady || !firebaseAuth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(firebaseAuth, (user) => {
    if (user) {
      SecureStore.setItemAsync(LAST_AUTH_USER_KEY, JSON.stringify({
        uid: user.uid,
        email: user.email || '',
        updatedAt: new Date().toISOString(),
      })).catch(() => {});
    } else {
      SecureStore.deleteItemAsync(LAST_AUTH_USER_KEY).catch(() => {});
    }
    callback(user);
  });
}

export async function signInWithEmail({ email, password, mode = 'sign-in' }) {
  const auth = requireFirebaseAuth();
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail || !password) {
    throw new Error('Enter an email and password.');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  if (mode === 'create') {
    return createUserWithEmailAndPassword(auth, cleanEmail, password);
  }
  return signInWithEmailAndPassword(auth, cleanEmail, password);
}

export async function resetPassword(email) {
  const auth = requireFirebaseAuth();
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) throw new Error('Enter your email first.');
  return sendPasswordResetEmail(auth, cleanEmail);
}

export async function signInWithGoogleIdToken(idToken) {
  const auth = requireFirebaseAuth();
  if (!idToken) throw new Error('Google did not return an ID token.');
  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
}

export async function signInWithApple() {
  const auth = requireFirebaseAuth();
  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    throw new Error('Apple sign-in is available only on supported Apple devices.');
  }

  const rawNonce = makeNonce();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  const appleCredential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  if (!appleCredential.identityToken) {
    throw new Error('Apple did not return an identity token.');
  }

  const provider = new OAuthProvider('apple.com');
  const credential = provider.credential({
    idToken: appleCredential.identityToken,
    rawNonce,
  });

  return signInWithCredential(auth, credential);
}

export async function signOutCurrentUser() {
  const auth = requireFirebaseAuth();
  await signOut(auth);
  await SecureStore.deleteItemAsync(LAST_AUTH_USER_KEY).catch(() => {});
}
