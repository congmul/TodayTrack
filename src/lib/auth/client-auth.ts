"use client";

let authTokenPromise: Promise<string> | null = null;

export async function getBearerToken() {
  if (!authTokenPromise) {
    authTokenPromise = fetch("/api/auth/session", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load the current app session.");
        }

        const payload = (await response.json()) as { token?: string };
        if (!payload.token) {
          throw new Error("No bearer token was returned by the session API.");
        }

        return payload.token;
      })
      .catch((error) => {
        authTokenPromise = null;
        throw error;
      });
  }

  return authTokenPromise;
}

export async function authorizedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
) {
  const token = await getBearerToken();
  const headers = new Headers(init.headers);

  headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, {
    ...init,
    headers,
  });
}
