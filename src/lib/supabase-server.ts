// Server-only Supabase client — never import in 'use client' components
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createServerClient = async () => {
  const cookieStore = await cookies();
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            );
          } catch {
            // setAll called from a Server Component — safe to ignore
          }
        },
      },
    }
  );
};
