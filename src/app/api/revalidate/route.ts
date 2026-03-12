import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json() as { path?: string; tag?: string };

    if (body.path) {
      revalidatePath(body.path);
    }

    if (body.tag) {
      revalidateTag(body.tag);
    }

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la revalidation" },
      { status: 500 }
    );
  }
}
