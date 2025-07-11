const idTokenKey = "digiphile:id_token";

export function setIdTokenToLocalStorage(idToken: string | null) {
  if (idToken) {
    localStorage.setItem(idTokenKey, idToken);
  } else {
    localStorage.removeItem(idTokenKey);
  }
}

export function getIdTokenFromLocalStorage(): string | null {
  return localStorage.getItem(idTokenKey);
}
