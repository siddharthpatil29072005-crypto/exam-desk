import { fetchCollectionAction, createRecordAction, deleteRecordAction } from "@/app/actions/db-actions";

export const FIREBASE_SETUP_MESSAGE = "Using MongoDB Atlas via Server Actions.";

export function subscribeToCollection(collectionName, onData, onError) {
  let isSubscribed = true;
  let interval;

  const fetchItems = async () => {
    try {
      const result = await fetchCollectionAction(collectionName);
      if (result.success && isSubscribed) {
        onData(result.data);
      } else if (result.error && isSubscribed) {
        if (onError) onError(new Error(result.error));
      }
    } catch (e) {
      if (onError && isSubscribed) onError(e);
    }
  };

  fetchItems();

  // Poll every 3 seconds to mimic realtime updates without overloading MongoDB
  interval = setInterval(fetchItems, 3000);

  return () => {
    isSubscribed = false;
    clearInterval(interval);
  };
}

export async function getCollection(collectionName) {
  const result = await fetchCollectionAction(collectionName);
  if (result.success) return result.data;
  return [];
}

export async function createRecord(collectionName, values) {
  const result = await createRecordAction(collectionName, values);
  if (!result.success) {
    const error = new Error(result.error);
    error.code = result.error.includes("permission") ? "permission-denied" : "unknown";
    throw error;
  }
  return result.id;
}

export async function deleteRecord(collectionName, id) {
  const result = await deleteRecordAction(collectionName, id);
  if (!result.success) throw new Error(result.error);
}

export function displayFirebaseError(error) {
  return error?.message || "Something went wrong. Please try again.";
}

export function subscribeToUserResults(userId, onData, onError) {
  let isSubscribed = true;
  let interval;

  const fetchItems = async () => {
    try {
      const result = await fetchCollectionAction("results");
      if (result.success && isSubscribed) {
        onData(result.data.filter(r => r.userId === userId));
      } else if (result.error && isSubscribed) {
        if (onError) onError(new Error(result.error));
      }
    } catch (e) {
      if (onError && isSubscribed) onError(e);
    }
  };

  fetchItems();
  interval = setInterval(fetchItems, 3000);

  return () => {
    isSubscribed = false;
    clearInterval(interval);
  };
}