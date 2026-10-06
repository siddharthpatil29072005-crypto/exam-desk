export const isFirebaseConfigured = true;
export const app = {};
export const auth = {};
export const db = {};

export function getFirebaseAnalytics() {
  return Promise.resolve(null);
}

export async function logAnalyticsEvent(eventName, parameters = {}) {}