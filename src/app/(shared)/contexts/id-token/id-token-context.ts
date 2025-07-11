import { createContext } from "react";

export interface IdTokenState {
  idToken: string | null;
}

export interface IdTokenContextType extends IdTokenState {
  setIdToken: (token: string | null) => void;
}

const IdTokenContext = createContext<IdTokenContextType | null>(null);

export default IdTokenContext;
