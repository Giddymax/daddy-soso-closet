import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "logo_url")
    .single();

  const logoUrl = data?.value;
  if (!logoUrl) {
    return new NextResponse(null, { status: 404 });
  }

  const response = await fetch(logoUrl);
  if (!response.ok) {
    return new NextResponse(null, { status: 502 });
  }

  const contentType = response.headers.get("content-type") || "image/png";
  const buffer = await response.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
