export type GoogleOAuthProfile = {
  providerUserId: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
};

type GoogleOAuthConfig = {
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  jwksUrl: string;
  scope: string;
  issuer: string | null;
};

type JwtClaims = Record<string, unknown> & {
  sub: string;
  aud?: string | string[];
  iss?: string;
  exp?: number;
  nbf?: number;
  nonce?: string;
  email?: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
};

export function buildGoogleLoginUrl(input: {
  appBaseUrl: string;
  state: string;
  nonce: string;
}) {
  const config = getGoogleOAuthConfig();
  const url = new URL(config.authorizeUrl);

  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", getGoogleCallbackUrl(input.appBaseUrl));
  url.searchParams.set("scope", config.scope);
  url.searchParams.set("state", input.state);
  url.searchParams.set("nonce", input.nonce);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "select_account");

  return url.toString();
}

export async function exchangeCodeForGoogleProfile(input: {
  code: string;
  appBaseUrl: string;
  expectedNonce: string;
}) {
  const config = getGoogleOAuthConfig();
  const tokenResponse = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code: input.code,
      redirect_uri: getGoogleCallbackUrl(input.appBaseUrl),
    }),
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    throw new Error("Google token exchange failed.");
  }

  const tokenPayload = (await tokenResponse.json()) as {
    id_token?: string;
  };

  if (!tokenPayload.id_token) {
    throw new Error("Google token response did not include an id_token.");
  }

  const claims = await verifyIdentityToken(tokenPayload.id_token, {
    audience: config.clientId,
    jwksUrl: config.jwksUrl,
    issuer: config.issuer,
    expectedNonce: input.expectedNonce,
  });

  return {
    providerUserId: claims.sub,
    email: typeof claims.email === "string" && claims.email.trim() ? claims.email : null,
    displayName: resolveDisplayName(claims),
    avatarUrl:
      typeof claims.picture === "string" && claims.picture.trim()
        ? claims.picture
        : null,
  } satisfies GoogleOAuthProfile;
}

function getGoogleOAuthConfig(): GoogleOAuthConfig {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error(
      "Google OAuth env vars are incomplete. Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET.",
    );
  }

  return {
    clientId,
    clientSecret,
    authorizeUrl:
      process.env.GOOGLE_OAUTH_AUTHORIZE_URL?.trim() ||
      "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl:
      process.env.GOOGLE_OAUTH_TOKEN_URL?.trim() ||
      "https://oauth2.googleapis.com/token",
    jwksUrl:
      process.env.GOOGLE_OAUTH_JWKS_URL?.trim() ||
      "https://www.googleapis.com/oauth2/v3/certs",
    scope: process.env.GOOGLE_OAUTH_SCOPE?.trim() || "openid email profile",
    issuer: process.env.GOOGLE_OAUTH_ISSUER?.trim() || "https://accounts.google.com",
  };
}

function getGoogleCallbackUrl(appBaseUrl: string) {
  return new URL("/api/auth/callback", appBaseUrl).toString();
}

async function verifyIdentityToken(
  token: string,
  input: {
    audience: string;
    jwksUrl: string;
    issuer: string | null;
    expectedNonce: string;
  },
) {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error("Identity token is malformed.");
  }

  const header = parseJwtPart<{ alg?: string; kid?: string }>(encodedHeader);
  const claims = parseJwtPart<JwtClaims>(encodedPayload);
  const signingInput = new TextEncoder().encode(
    `${encodedHeader}.${encodedPayload}`,
  );
  const signature = decodeBase64Url(encodedSignature);

  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Identity token uses an unsupported signing algorithm.");
  }

  const key = await resolveSigningKey(input.jwksUrl, header.kid);
  const isValid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    signature,
    signingInput,
  );

  if (!isValid) {
    throw new Error("Identity token signature is invalid.");
  }

  assertJwtClaims(claims, input);
  return claims;
}

async function resolveSigningKey(jwksUrl: string, keyId: string) {
  const response = await fetch(jwksUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to load Google JWKS.");
  }

  const jwks = (await response.json()) as {
    keys?: Array<JsonWebKey & { kid?: string }>;
  };
  const key = jwks.keys?.find((candidate) => candidate.kid === keyId);

  if (!key) {
    throw new Error("No Google signing key matched the identity token.");
  }

  return crypto.subtle.importKey(
    "jwk",
    key,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["verify"],
  );
}

function assertJwtClaims(
  claims: JwtClaims,
  input: {
    audience: string;
    issuer: string | null;
    expectedNonce: string;
  },
) {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];

  if (!claims.sub?.trim()) {
    throw new Error("Identity token is missing a subject.");
  }

  if (!audiences.includes(input.audience)) {
    throw new Error("Identity token audience does not match the app.");
  }

  if (input.issuer && claims.iss !== input.issuer) {
    throw new Error("Identity token issuer does not match the configured issuer.");
  }

  if (typeof claims.exp !== "number" || claims.exp <= nowInSeconds) {
    throw new Error("Identity token has expired.");
  }

  if (typeof claims.nbf === "number" && claims.nbf > nowInSeconds) {
    throw new Error("Identity token is not active yet.");
  }

  if (!input.expectedNonce || claims.nonce !== input.expectedNonce) {
    throw new Error("Identity token nonce is invalid.");
  }
}

function resolveDisplayName(claims: JwtClaims) {
  if (typeof claims.name === "string" && claims.name.trim()) {
    return claims.name;
  }

  const givenName =
    typeof claims.given_name === "string" ? claims.given_name.trim() : "";
  const familyName =
    typeof claims.family_name === "string" ? claims.family_name.trim() : "";
  const fullName = `${givenName} ${familyName}`.trim();

  return fullName || "TodayTrack User";
}

function parseJwtPart<T>(value: string) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
}

function decodeBase64Url(value: string) {
  return Uint8Array.from(Buffer.from(value, "base64url"));
}
