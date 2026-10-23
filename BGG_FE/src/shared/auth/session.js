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
