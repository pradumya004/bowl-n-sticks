// Turning a stored path into something the browser can fetch.
//
// The database holds a PATH inside the bucket ("items/abc.webp"), not a URL,
// because a URL would hard-code the Supabase project ref. This project already
// changed refs once, which would have broken every stored image. The project
// URL is an env var, so the two are joined here at render time.
export const MEDIA_BUCKET = "menu-media";

export function mediaUrl(path) {
  if (!path) {
    return null;
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}
