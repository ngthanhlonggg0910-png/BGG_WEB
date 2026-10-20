const USER_KEY = "user";

function readUser(storage) {
  try {
    const serializedUser = storage?.getItem(USER_KEY);
    return serializedUser ? JSON.parse(serializedUser) : null;
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  return readUser(localStorage) || readUser(sessionStorage);
}

export function getCurrentProfile() {
  return getCurrentUser()?.data ?? null;
}

export function getAccountId() {
  return getCurrentProfile()?.TKId ?? null;
}

export function saveUser(user, rememberMe) {
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);

  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);
}
