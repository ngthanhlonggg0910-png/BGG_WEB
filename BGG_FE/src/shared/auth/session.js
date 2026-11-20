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

export function getAccessToken() {
  const token = getCurrentProfile()?.accessToken;
  return typeof token === "string" && token ? token : null;
}

// Expiry as read from the token payload. Only a UX shortcut: the server
// verifies the signature and expiry on every request.
function tokenExpiresAt(token) {
  try {
    const payload = token.split(".")[0].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload));
    return Number.isFinite(exp) ? exp * 1000 : 0;
  } catch {
    return 0;
  }
}

// Sessions saved before login tokens existed have no accessToken and count as
// logged out, so those users are sent to the login page once.
export function hasValidSession() {
  const token = getAccessToken();
  return Boolean(token) && tokenExpiresAt(token) > Date.now();
}

export function saveUser(user, rememberMe) {
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);

  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(USER_KEY, JSON.stringify(user));

  // A remembered login must survive closing and reopening an installed PWA.
  // This is best-effort: browsers may decline the request, but localStorage
  // remains the source of truth and is only cleared by an explicit logout.
  if (rememberMe && navigator.storage?.persist) {
    void navigator.storage.persist().catch(() => {});
  }
}

export function clearSession() {
  const pushToken = getCurrentProfile()?.pushToken;
  // Detach this browser even if the server is unavailable. The retired endpoint
  // cannot deliver notifications after another user logs in on a shared device.
  if ("serviceWorker" in navigator) {
    void navigator.serviceWorker.getRegistration().then(async registration => {
      const subscription = await registration?.pushManager?.getSubscription();
      if (!subscription) return;
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      if (pushToken) await fetch('/api/push/unsubscribe', {
        method: 'POST', keepalive: true,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pushToken}` },
        body: JSON.stringify({ endpoint }),
      });
    }).catch(() => {});
  }
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);
}
