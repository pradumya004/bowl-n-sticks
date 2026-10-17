// Resolves the app's "@/..." alias and swaps the two modules that need a real
// Next/Supabase runtime for local stubs, so the REAL action code can run in Node.

const WEB = new URL("../", import.meta.url).href;
const HERE = import.meta.url;

export function resolve(specifier, context, next) {
  if (specifier === "@/lib/supabase/server") {
    return next(new URL("./stub-supabase.mjs", HERE).href, context);
  }
  if (specifier === "next/cache") {
    return next(new URL("./stub-next-cache.mjs", HERE).href, context);
  }
  if (specifier === "@/lib/debug") {
    return next(new URL("./stub-debug.mjs", HERE).href, context);
  }
  if (specifier.startsWith("@/")) {
    const rest = specifier.slice(2);
    return next(WEB + (rest.endsWith(".js") ? rest : rest + ".js"), context);
  }
  // Relative extensionless imports inside the app (e.g. "./shared").
  if (specifier.startsWith(".") && !/\.[a-z]+$/.test(specifier) && context.parentURL?.startsWith(WEB)) {
    return next(specifier + ".js", context);
  }
  return next(specifier, context);
}

// The app's .js files are ESM, but web/package.json has no "type": "module",
// so Node would load them as CommonJS. Force the right format.
export function load(url, context, next) {
  if (url.startsWith(WEB) && url.endsWith(".js")) {
    return next(url, { ...context, format: "module" });
  }
  return next(url, context);
}
