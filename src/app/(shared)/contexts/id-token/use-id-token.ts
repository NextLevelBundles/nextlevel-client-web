import { useContext } from "react";
import IdTokenContext from "./id-token-context";

export function useIdToken() {
  const context = useContext(IdTokenContext);
  if (!context) {
    throw new Error("useIdToken must be used within an IdTokenProvider");
  }
  return context;
}
