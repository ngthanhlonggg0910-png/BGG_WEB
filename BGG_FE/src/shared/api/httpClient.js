import { clearSession, getAccessToken } from "../auth/session";

function normalizeMojibake(value) {
  if (typeof value !== "string" || !/[ÃÂ]|á[º»]/u.test(value)) {
    return value;
  }

  try {
    const bytes = Uint8Array.from(value, (character) =>
      character.charCodeAt(0),
    );
    const normalized = new TextDecoder("utf-8", { fatal: true }).decode(bytes);

    return normalized.includes("�") ? value : normalized;
  } catch {
    return value;
  }
}

function normalizeApiMessage(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return data;
  }

  if (typeof data.message === "string") {
    return { ...data, message: normalizeMojibake(data.message) };
  }

  if (Array.isArray(data.message)) {
    return {
      ...data,
      message: data.message.map(normalizeMojibake),
    };
  }

  return data;
}

function authHeaders(extra = {}) {
  const token = getAccessToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

let redirectingToLogin = false;

// The login token is missing, expired or rejected: drop the stored session and
// reload, so PrivateRoute sends the user to /login and back here afterwards.
function handleUnauthorized(response) {
  if (response.status !== 401 || redirectingToLogin) return;
  redirectingToLogin = true;
  clearSession();
  window.location.reload();
}

export async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  handleUnauthorized(response);

  const data = normalizeApiMessage(await response.json());

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message || `HTTP ${response.status}: ${response.statusText}`;

    throw new Error(message);
  }

  return data;
}

export async function postFormData(url, formData) {
  const response = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  handleUnauthorized(response);

  const data = normalizeApiMessage(await response.json());

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message || `HTTP ${response.status}: ${response.statusText}`;

    throw new Error(message);
  }

  return data;
}

export async function getJson(url) {
  const response = await fetch(url, { headers: authHeaders() });

  handleUnauthorized(response);

  if (!response.ok) {
    throw new Error("HTTP Error");
  }

  return await response.json();
}

// Tải file (PDF/Word/Excel/ảnh) có kèm token đăng nhập. <img>/<iframe>/<a href>/pdf.js
// không gửi được header Authorization, nên tải về thành Blob rồi dùng blob URL.
export async function fetchBlob(url) {
  const response = await fetch(url, { headers: authHeaders() });

  handleUnauthorized(response);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.blob();
}
