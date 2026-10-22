// Reading build-time configuration.
//
// Vite replaces import.meta.env at build time. The global fallback lets these
// modules run outside a bundler, which is what the tests rely on.

export function readEnv() {
  if (typeof import.meta.env !== "undefined" && import.meta.env) return import.meta.env;
  return globalThis.__APP_ENV__ ?? {};
}
