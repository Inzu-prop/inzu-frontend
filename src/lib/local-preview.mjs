// Both checks are required. A production build can never enable this mode.
export function isLocalPreviewEnabled() {
  return process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_LOCAL_PREVIEW === "true";
}

export function isPreviewPath(pathname) {
  return pathname === "/preview" || pathname.startsWith("/preview/");
}

export function isLoopbackHost(hostname) {
  return ["localhost", "127.0.0.1", "[::1]", "::1"].includes(hostname);
}

export function isLoopbackAuthority(authority) {
  return typeof authority === "string" && /^(localhost|127\.0\.0\.1|\[::1\])(?::[0-9]+)?$/.test(authority);
}
