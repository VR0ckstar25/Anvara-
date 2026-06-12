import { requireOptionalNativeModule } from 'expo-modules-core';

const nativeModule = requireOptionalNativeModule('AnvaraOcr');

export function isAvailable() {
  return !!nativeModule?.recognizeText;
}

export async function recognizeText(uri) {
  if (!nativeModule?.recognizeText) {
    throw new Error('Anvara OCR is not available in this build.');
  }
  return nativeModule.recognizeText(uri);
}
