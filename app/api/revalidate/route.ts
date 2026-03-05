import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

type Body = {
  secret?: string;
  tags?: string[];
  paths?: string[];
};

export async function POST(req: NextRequest) {
  let body: Body;

  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.secret || body.secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  for (const tag of body.tags ?? []) {
    revalidateTag(tag);
  }

  for (const path of body.paths ?? []) {
    revalidatePath(path);
  }

  return NextResponse.json({ ok: true, tags: body.tags ?? [], paths: body.paths ?? [] });
}