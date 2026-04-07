import Image, { ImageProps } from "next/image";

/**
 * Wrapper around next/image that bypasses optimisation for Supabase Storage URLs.
 * This prevents the 400 upstream error caused by Next.js trying to re-process
 * images that are already served from Supabase CDN.
 */
type SupabaseImageProps = Omit<ImageProps, "unoptimized">;

export default function SupabaseImage({ src, ...props }: SupabaseImageProps) {
  const isExternal =
    typeof src === "string" &&
    (src.includes("supabase.co") || src.startsWith("http"));

  return <Image src={src} unoptimized={isExternal} {...props} />;
}
