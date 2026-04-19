export function isMissingCosmosResourceError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const code =
    "code" in error && typeof error.code === "number" ? error.code : null;
  const message =
    "message" in error && typeof error.message === "string"
      ? error.message.toLowerCase()
      : "";

  if (code === 404) {
    return true;
  }

  return (
    message.includes("owner resource does not exist") ||
    message.includes("resource does not exist") ||
    message.includes("resource not found")
  );
}
