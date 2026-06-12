import data from '../data/allergens.json';
import {
  buildOfflinePackFromData,
  estimateOfflinePackFromData,
  formatBytes,
  OFFLINE_PACKS,
  OFFLINE_RECOMMENDATION_VERSION,
  recommendedOfflinePackIds,
  usesLegacyBroadRecommendation,
} from './offlinePacksCore.js';

export {
  formatBytes,
  OFFLINE_PACKS,
  OFFLINE_RECOMMENDATION_VERSION,
  recommendedOfflinePackIds,
  usesLegacyBroadRecommendation,
};

export function buildOfflinePack(profile, selectedPackIds) {
  return buildOfflinePackFromData(data, profile, selectedPackIds);
}

export function estimateOfflinePack(profile, selectedPackIds) {
  return estimateOfflinePackFromData(data, profile, selectedPackIds);
}
