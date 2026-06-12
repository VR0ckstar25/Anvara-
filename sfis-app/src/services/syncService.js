import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { firestoreDb, firebaseReady } from './firebaseClient';

function requireDb() {
  if (!firebaseReady || !firestoreDb) {
    throw new Error('Cloud sync is not configured.');
  }
  return firestoreDb;
}

function cleanForFirestore(value) {
  if (value == null) return null;
  return JSON.parse(JSON.stringify(value));
}

function cloudSafeScan(scan) {
  const clean = cleanForFirestore(scan);
  if (!clean) return null;
  const { image, ocr, ...rest } = clean;
  return {
    ...rest,
    ocr: ocr
      ? {
          confidence: ocr.confidence ?? null,
          capturedAt: ocr.capturedAt || null,
          textStored: false,
        }
      : null,
    labelImage: image
      ? {
          capturedAt: image.capturedAt || null,
          deleteAfter: image.deleteAfter || null,
          retainedOnDevice: !!image.retainedOnDevice,
        }
      : null,
  };
}

function docData(snapshot) {
  const data = snapshot.data();
  if (!data) return null;
  const { cloudUpdatedAt, ...rest } = data;
  return rest;
}

function userRoot(uid) {
  const db = requireDb();
  return doc(db, 'users', uid);
}

export async function saveCloudProfile(uid, profile) {
  if (!uid || !profile) return null;
  const ref = doc(userRoot(uid), 'profile', 'self');
  await setDoc(ref, {
    ...cleanForFirestore(profile),
    cloudUpdatedAt: serverTimestamp(),
  }, { merge: true });
  return ref.id;
}

export async function saveCloudScan(uid, scan) {
  if (!uid || !scan?.id) return null;
  const ref = doc(userRoot(uid), 'scans', scan.id);
  await setDoc(ref, {
    ...cloudSafeScan(scan),
    cloudUpdatedAt: serverTimestamp(),
  }, { merge: true });
  return ref.id;
}

export async function saveCloudFeedback(uid, feedback) {
  if (!uid || !feedback?.id) return null;
  const ref = doc(userRoot(uid), 'feedback', feedback.id);
  await setDoc(ref, {
    ...cleanForFirestore(feedback),
    cloudUpdatedAt: serverTimestamp(),
  }, { merge: true });
  return ref.id;
}

export async function saveCloudEvent(uid, event) {
  if (!uid || !event?.id) return null;
  const ref = doc(userRoot(uid), 'events', event.id);
  await setDoc(ref, {
    ...cleanForFirestore(event),
    cloudUpdatedAt: serverTimestamp(),
  }, { merge: true });
  return ref.id;
}

export async function pushLocalSnapshot(uid, { profile, scans = [], feedback = [] }) {
  if (!uid) return;
  await setDoc(userRoot(uid), {
    lastSyncAt: serverTimestamp(),
    schemaVersion: 1,
  }, { merge: true });
  if (profile) await saveCloudProfile(uid, profile);
  await Promise.all(scans.slice(0, 200).map((scan) => saveCloudScan(uid, scan)));
  await Promise.all(feedback.slice(0, 200).map((entry) => saveCloudFeedback(uid, entry)));
}

export async function pullCloudSnapshot(uid) {
  if (!uid) return { profile: null, scans: [], feedback: [] };
  const profileSnap = await getDoc(doc(userRoot(uid), 'profile', 'self'));
  const scanSnap = await getDocs(query(collection(userRoot(uid), 'scans'), orderBy('savedAt', 'desc'), limit(200)));
  const feedbackSnap = await getDocs(query(collection(userRoot(uid), 'feedback'), orderBy('createdAt', 'desc'), limit(200)));

  return {
    profile: profileSnap.exists() ? docData(profileSnap) : null,
    scans: scanSnap.docs.map(docData).filter(Boolean),
    feedback: feedbackSnap.docs.map(docData).filter(Boolean),
  };
}

export async function deleteCloudSnapshot(uid) {
  if (!uid) return;
  const scans = await getDocs(collection(userRoot(uid), 'scans'));
  const feedback = await getDocs(collection(userRoot(uid), 'feedback'));
  const events = await getDocs(collection(userRoot(uid), 'events'));
  await Promise.all(scans.docs.map((item) => deleteDoc(item.ref)));
  await Promise.all(feedback.docs.map((item) => deleteDoc(item.ref)));
  await Promise.all(events.docs.map((item) => deleteDoc(item.ref)));
  await deleteDoc(doc(userRoot(uid), 'profile', 'self'));
}
