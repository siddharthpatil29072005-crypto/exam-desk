"use client";

import { useEffect, useState } from "react";
import { displayFirebaseError, subscribeToUserResults } from "@/lib/firestore";

export function useResults(userId) {
  const [state, setState] = useState(() => ({
    userId,
    results: [],
    loading: Boolean(userId),
    error: "",
  }));

  const currentState = state.userId === userId
    ? state
    : { userId, results: [], loading: Boolean(userId), error: "" };

  useEffect(() => {
    if (!userId) return;

    return subscribeToUserResults(
      userId,
      (nextResults) => {
        const sortedResults = [...nextResults].sort((first, second) => {
          const firstDate = first.submittedAt?.toDate?.()?.getTime?.() || new Date(first.submittedAt).getTime();
          const secondDate = second.submittedAt?.toDate?.()?.getTime?.() || new Date(second.submittedAt).getTime();
          return secondDate - firstDate;
        });
        setState({ userId, results: sortedResults, loading: false, error: "" });
      },
      (nextError) => {
        setState({ userId, results: [], loading: false, error: displayFirebaseError(nextError) });
      },
    );
  }, [userId]);

  return { results: currentState.results, loading: currentState.loading, error: currentState.error };
}