import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AssetType, Currency } from "@prisma/client";
import { auth } from "@/auth";

const ASSET_TYPES = new Set<string>(Object.values(AssetType));
const CURRENCIES = new Set<string>(Object.values(Currency));

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const positions = await prisma.position.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(positions);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const created = await prisma.position.create({
    data: { ...parsed.data, userId: session.user.id },
  });
  return NextResponse.json(created, { status: 201 });
}

type PositionInput = {
  name: string;
  ticker: string;
  assetType: AssetType;
  quantity: number;
  purchasePrice: number;
  purchaseCurrency: Currency;
  purchaseDate: Date;
};

export function parsePositionInput(
  raw: unknown
): { data: PositionInput } | { error: string } {
  if (!raw || typeof raw !== "object") return { error: "Body must be an object" };
  const b = raw as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  const ticker = typeof b.ticker === "string" ? b.ticker.trim().toUpperCase() : "";
  const assetType = typeof b.assetType === "string" ? b.assetType : "";
  const purchaseCurrency =
    typeof b.purchaseCurrency === "string" ? b.purchaseCurrency : "";
  const quantity = Number(b.quantity);
  const purchasePrice = Number(b.purchasePrice);
  const purchaseDateStr =
    typeof b.purchaseDate === "string" ? b.purchaseDate : "";

  if (!name) return { error: "Name is required" };
  if (!ticker) return { error: "Ticker is required" };
  if (!ASSET_TYPES.has(assetType)) return { error: "Invalid asset type" };
  if (!CURRENCIES.has(purchaseCurrency)) return { error: "Invalid currency" };
  if (!Number.isFinite(quantity) || quantity <= 0)
    return { error: "Quantity must be a positive number" };
  if (!Number.isFinite(purchasePrice) || purchasePrice < 0)
    return { error: "Purchase price must be a non-negative number" };
  const purchaseDate = new Date(purchaseDateStr);
  if (Number.isNaN(purchaseDate.getTime()))
    return { error: "Invalid purchase date" };

  return {
    data: {
      name,
      ticker,
      assetType: assetType as AssetType,
      quantity,
      purchasePrice,
      purchaseCurrency: purchaseCurrency as Currency,
      purchaseDate,
    },
  };
}
