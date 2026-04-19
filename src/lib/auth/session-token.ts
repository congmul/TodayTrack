import type { AuthUserDto } from "@/lib/services/auth-service";

type SessionTokenPayload = {
  sub: string;
  provider: AuthUserDto["provider"];
  exp: number;
  iat: number;
};

const defaultSessionSecret = "todaytrack-dev-session-secret";

export async function createSessionToken(input: {
  user: AuthUserDto;
  expiresAt: number;
}) {
  const payload: SessionTokenPayload = {
    sub: input.user.id,
    provider: input.user.provider,
    iat: Date.now(),
    exp: input.expiresAt,
  };

  const encodedPayload = encodeBase64Url(
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  const signature = await signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const [encodedPayload, encodedSignature] = token.split(".");
  if (!encodedPayload || !encodedSignature) {
    return null;
  }

  const expectedSignature = await signValue(encodedPayload);
  if (encodedSignature !== expectedSignature) {
    return null;
  }

  const payload = JSON.parse(
    new TextDecoder().decode(decodeBase64Url(encodedPayload)),
  ) as SessionTokenPayload;

  if (typeof payload.exp !== "number" || payload.exp <= Date.now()) {
    return null;
  }

  return payload;
}

async function signValue(value: string) {
  const secret = process.env.APP_SESSION_SECRET || defaultSessionSecret;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );

  return encodeBase64Url(new Uint8Array(signature));
}

function encodeBase64Url(bytes: Uint8Array) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64url");
  }

  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  if (typeof Buffer !== "undefined") {
    return Uint8Array.from(Buffer.from(value, "base64url"));
  }

  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
