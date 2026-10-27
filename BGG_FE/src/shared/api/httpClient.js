function normalizeMojibake(value) {
  if (typeof value !== "string" || !(/[ÃÂ]|á[º»]/u.test(value))) {
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

export async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

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
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      const text = await response.text();

      console.error("Server trả về HTML/Text:", text.slice(0, 300));

      throw new Error(`API không trả về JSON. URL: ${response.url}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
