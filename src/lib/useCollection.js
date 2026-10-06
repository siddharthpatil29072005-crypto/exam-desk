"use client";

import { useEffect, useState } from "react";
import { displayFirebaseError, subscribeToCollection } from "@/lib/firestore";

export function useCollection(collectionName) {
  const [state, setState] = useState(() => ({
    collectionName,
    items: [],
    loading: true,
    error: "",
  }));

  const currentState = state.collectionName === collectionName
    ? state
    : {
        collectionName,
        items: [],
        loading: true,
        error: "",
      };

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      collectionName,
      (nextItems) => {
        setState({ collectionName, items: nextItems, loading: false, error: "" });
      },
      (nextError) => {
        setState({ collectionName, items: [], loading: false, error: displayFirebaseError(nextError) });
      },
    );
    return unsubscribe;
  }, [collectionName, refreshTrigger]);

  const refresh = () => setRefreshTrigger(prev => prev + 1);

  return { items: currentState.items, loading: currentState.loading, error: currentState.error, refresh };
}