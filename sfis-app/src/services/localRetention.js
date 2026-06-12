import * as FileSystem from 'expo-file-system';

export const LABEL_IMAGE_RETENTION_DAYS = 7;
const RETENTION_MS = LABEL_IMAGE_RETENTION_DAYS * 24 * 60 * 60 * 1000;

function isLocalFile(uri) {
  return typeof uri === 'string' && uri.startsWith('file://');
}

export function enrichCapturedImage(image, saveLabelImages) {
  if (!image?.uri) return null;
  const capturedAt = image.capturedAt || new Date().toISOString();
  return {
    uri: image.uri,
    capturedAt,
    retainedOnDevice: !!saveLabelImages,
    deleteAfter: saveLabelImages ? null : new Date(new Date(capturedAt).getTime() + RETENTION_MS).toISOString(),
  };
}

export async function cleanupExpiredLabelImages(scans = [], saveLabelImages = false) {
  if (saveLabelImages) return scans;
  const now = Date.now();
  const next = [];

  for (const scan of scans) {
    const image = scan?.image;
    const expired = image?.deleteAfter && new Date(image.deleteAfter).getTime() <= now;
    if (expired && isLocalFile(image.uri)) {
      await FileSystem.deleteAsync(image.uri, { idempotent: true }).catch(() => {});
    }
    next.push(expired ? { ...scan, image: null } : scan);
  }

  return next;
}
