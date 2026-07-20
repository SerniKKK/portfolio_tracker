import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { searchAll } from "@/lib/search";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = new URL(req.url).searchParams.get("q") ?? "";
  const results = await searchAll(q);
  return NextResponse.json({ results });
}
