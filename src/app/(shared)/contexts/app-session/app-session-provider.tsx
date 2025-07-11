"use client";

import { Session } from "next-auth";
import { useContext, useReducer, ReactNode } from "react";
import AppSessionContext, { AppSessionState } from "./app-session-context";

interface AppSessionProviderProps {
  children: ReactNode;
  initialSession?: Session | null;
}

type AppSessionAction = { type: "SET_SESSION"; payload: Session | null };

const initialState: AppSessionState = {
  session: null,
  isLoading: false,
  error: null,
};

function appSessionReducer(
  state: AppSessionState,
  action: AppSessionAction
): AppSessionState {
  switch (action.type) {
    case "SET_SESSION":
      return { ...state, session: action.payload };
    default:
      return state;
  }
}

export default function AppSessionProvider({
  children,
  initialSession = null,
}: AppSessionProviderProps) {
  const [state, dispatch] = useReducer(appSessionReducer, {
    ...initialState,
    session: initialSession || null,
  });

  const value = {
    ...state,
    setSession: (session: Session | null) => {
      dispatch({ type: "SET_SESSION", payload: session });
    },
  };

  return (
    <AppSessionContext.Provider value={value}>
      {children}
    </AppSessionContext.Provider>
  );
}

export function useAppSession() {
  const context = useContext(AppSessionContext);
  if (context === undefined) {
    throw new Error("useAppSession must be used within a AppSessionProvider");
  }
  return context;
}
