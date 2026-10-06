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

  useEffect(() => {
    return subscribeToCollection(
      collectionName,
      (nextItems) => {
        setState({ collectionName, items: nextItems, loading: false, error: "" });
      },
      (nextError) => {
        setState({ collectionName, items: [], loading: false, error: displayFirebaseError(nextError) });
      },
    );
  }, [collectionName]);

  return { items: currentState.items, loading: currentState.loading, error: currentState.error };
}