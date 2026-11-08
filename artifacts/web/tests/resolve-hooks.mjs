// Next.js resolves extension-less and extension-full specifiers in its bundler;
// Node's ESM resolver needs the real file name. These hooks let the route
// handlers and their imports run directly under `node --test`.
const EXTENSIONLESS = /^\.{1,2}\//;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "next/server") return nextResolve("next/server.js", context);
  if (specifier === "next/headers") return nextResolve("next/headers.js", context);

  if (EXTENSIONLESS.test(specifier) && !/\.[cm]?[jt]sx?$/.test(specifier)) {
    for (const extension of [".ts", ".tsx", ".mts", ".js", ".mjs"]) {
      try {
        return await nextResolve(specifier + extension, context);
      } catch {
        // Try the next extension.
      }
    }
  }

  return nextResolve(specifier, context);
}
