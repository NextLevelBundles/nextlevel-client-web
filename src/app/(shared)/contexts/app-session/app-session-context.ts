import { Session } from "next-auth";
import { createContext } from "react";

export interface AppSessionState {
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

export interface AppSessionContextType extends AppSessionState {
  setSession: (item: Session | null) => void;
}

const AppSessionContext = createContext<AppSessionContextType | undefined>(
  undefined
);

export default AppSessionContext;
