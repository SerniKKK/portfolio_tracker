import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { parsePositionInput } from "../route";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parsePositionInput(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // externalId is set at creation from search and identifies which coin this
  // is; an edit changes quantity/price/date, never the instrument, so preserve
  // it rather than letting a payload without it null the coin id out.
  const { externalId: _externalId, ...updateData } = parsed.data;

  const result = await prisma.position.updateMany({
    where: { id, userId: session.user.id },
    data: updateData,
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Position not found" }, { status: 404 });
  }

  const updated = await prisma.position.findUnique({ where: { id } });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const result = await prisma.position.deleteMany({
    where: { id, userId: session.user.id },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Position not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
