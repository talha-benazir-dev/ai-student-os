"use client";

import { useCallback, useState, type SetStateAction } from "react";

/** New commands can target the page that's already mounted. Consume each request
 * without closing the dialog when the route clears its query parameter. */
export function useRequestedDialog(requested: boolean) {
  const [state, setState] = useState({ requested, open: requested });
  if (state.requested !== requested) {
    setState({ requested, open: state.open || requested });
  }
  const setOpen = useCallback((next: SetStateAction<boolean>) => {
    setState((previous) => ({
      ...previous,
      open: typeof next === "function" ? next(previous.open) : next,
    }));
  }, []);
  return [state.open, setOpen] as const;
}
