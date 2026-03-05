import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { cacheTags } from "@/lib/cache/tags";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    secret?: string;
    changedSlug?: string;
  };

  if (!body.secret || body.secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag(cacheTags.municipiosEnergia);
  revalidateTag(cacheTags.pseoSlugs);
  revalidateTag(cacheTags.sitemaps);
  if (body.changedSlug) {
    revalidateTag(cacheTags.municipiosEnergiaBySlug(body.changedSlug));
    revalidateTag(cacheTags.municipality(body.changedSlug));
    revalidateTag(cacheTags.placas(body.changedSlug));
    revalidateTag(cacheTags.ibi(body.changedSlug));
    revalidateTag(cacheTags.solar(body.changedSlug));
    revalidateTag(cacheTags.radiationByMunicipality(body.changedSlug));
  }

  revalidatePath("/sitemap_index.xml");

  return NextResponse.json({
    ok: true,
    revalidated: {
      index: "/sitemap_index.xml",
      changedSlug: body.changedSlug ?? null
    }
  });
}
