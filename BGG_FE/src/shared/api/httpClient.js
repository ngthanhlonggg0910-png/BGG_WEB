export async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

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
