import { Platform } from 'react-native';

let nativeOcrModule;
let nativeOcrLoadError;

function getNativeOcrModule() {
  if (nativeOcrModule || nativeOcrLoadError) return nativeOcrModule;
  try {
    nativeOcrModule = require('anvara-ocr');
  } catch (error) {
    nativeOcrLoadError = error;
    nativeOcrModule = null;
  }
  return nativeOcrModule;
}

export function ocrAvailable() {
  return !!getNativeOcrModule()?.isAvailable?.();
}

export async function recognizeIngredientText(imageUri) {
  if (!imageUri) throw new Error('No image was captured.');
  if (!ocrAvailable()) {
    throw new Error(
      Platform.OS === 'web'
        ? 'Camera OCR needs an iOS or Android development build.'
        : 'On-device OCR native module is not installed in this build.',
    );
  }

  const result = await getNativeOcrModule().recognizeText(imageUri);
  const text = result?.text || '';
  if (!text.trim()) {
    throw new Error('No readable ingredient text was found.');
  }
  return {
    text,
    confidence: result?.confidence ?? null,
    blocks: result?.blocks || [],
  };
}
