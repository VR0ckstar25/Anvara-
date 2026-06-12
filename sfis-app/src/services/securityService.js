import * as Crypto from 'expo-crypto';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000;

async function randomSalt() {
  try {
    const bytes = await Crypto.getRandomBytesAsync(16);
    return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
  }
}

async function hashPin(pin, salt) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${pin}`,
  );
}

export function isSecurityEnabled(security) {
  return !!(security?.appLockEnabled && security?.salt && security?.pinHash);
}

export function isSecurityLockedOut(security) {
  if (!security?.lockedUntil) return false;
  return new Date(security.lockedUntil).getTime() > Date.now();
}

export function lockoutMessage(security) {
  if (!isSecurityLockedOut(security)) return '';
  const minutes = Math.max(1, Math.ceil((new Date(security.lockedUntil).getTime() - Date.now()) / 60000));
  return `Too many wrong attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
}

export async function createPinSecurity(pin) {
  const clean = String(pin || '').trim();
  if (clean.length < 4) {
    throw new Error('Use at least 4 digits or characters.');
  }
  const salt = await randomSalt();
  const pinHash = await hashPin(clean, salt);
  const now = new Date().toISOString();
  return {
    appLockEnabled: true,
    salt,
    pinHash,
    failedAttempts: 0,
    lockedUntil: null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function verifyPin(security, pin) {
  if (!isSecurityEnabled(security)) return { ok: true };
  const blocked = lockoutMessage(security);
  if (blocked) return { ok: false, error: blocked };
  const pinHash = await hashPin(String(pin || '').trim(), security.salt);
  return pinHash === security.pinHash
    ? { ok: true }
    : { ok: false, error: 'That PIN did not match.' };
}

export function recordFailedUnlock(security) {
  const attempts = (security?.failedAttempts || 0) + 1;
  return {
    ...security,
    failedAttempts: attempts,
    lockedUntil: attempts >= MAX_FAILED_ATTEMPTS
      ? new Date(Date.now() + LOCKOUT_MS).toISOString()
      : null,
    updatedAt: new Date().toISOString(),
  };
}

export function recordSuccessfulUnlock(security) {
  return {
    ...security,
    failedAttempts: 0,
    lockedUntil: null,
    updatedAt: new Date().toISOString(),
  };
}

export function disablePinSecurity(security = {}) {
  return {
    ...security,
    appLockEnabled: false,
    salt: null,
    pinHash: null,
    failedAttempts: 0,
    lockedUntil: null,
    updatedAt: new Date().toISOString(),
  };
}
