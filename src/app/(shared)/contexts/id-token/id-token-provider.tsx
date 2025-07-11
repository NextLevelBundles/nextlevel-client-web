"use client";

import { ReactNode, useReducer, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import IdTokenContext, {
  IdTokenContextType,
  IdTokenState,
} from "./id-token-context";
import { setIdTokenToLocalStorage } from "./id-token-servie";

interface IdTokenProviderProps {
  children: ReactNode;
}

type IdTokenAction = { type: "SET_ID_TOKEN"; payload: string | null };

const initialState: IdTokenState = {
  idToken: null,
};

function idTokenReducer(
  state: IdTokenState,
  action: IdTokenAction
): IdTokenState {
  switch (action.type) {
    case "SET_ID_TOKEN":
      setIdTokenToLocalStorage(action.payload);
      return {
        ...state,
        idToken: action.payload ?? null,
      };
    default:
      return state;
  }
}

export function IdTokenProvider({ children }: IdTokenProviderProps) {
  const [state, dispatch] = useReducer(idTokenReducer, initialState);
  const session = useSession();

  const setIdToken = useCallback(async () => {
    const idToken = session?.data?.id_token as string | undefined;
    dispatch({ type: "SET_ID_TOKEN", payload: idToken ?? null });
  }, [session?.data?.id_token]);

  useEffect(() => {
    if (session.status === "authenticated") {
      setIdToken();
    } else {
      dispatch({ type: "SET_ID_TOKEN", payload: null });
    }
  }, [session.status, setIdToken]);

  const value: IdTokenContextType = {
    ...state,
    setIdToken,
  };

  return (
    <IdTokenContext.Provider value={value}>{children}</IdTokenContext.Provider>
  );
}
