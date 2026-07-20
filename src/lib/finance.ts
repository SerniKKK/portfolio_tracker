import type { Position } from "@prisma/client";
import type { LivePrice } from "./prices";
import type { FxRatesToPLN } from "./fx";
import { convertToPLN } from "./fx";

export type PositionMetrics = {
  position: Position;
  livePrice: LivePrice;
  currentValueNative: number;
  costNative: number;
  currentValuePLN: number;
  costPLN: number;
  pnlPLN: number;
  pnlPct: number;
};

export function computePositionMetrics(
  position: Position,
  livePrice: LivePrice,
  rates: FxRatesToPLN
): PositionMetrics {
  const currentValueNative = livePrice.price * position.quantity;
  const costNative = position.purchasePrice * position.quantity;

  const currentValuePLN = convertToPLN(
    currentValueNative,
    livePrice.currency,
    rates
  );
  const costPLN = convertToPLN(costNative, position.purchaseCurrency, rates);

  const pnlPLN = currentValuePLN - costPLN;
  const pnlPct = costPLN > 0 ? pnlPLN / costPLN : 0;

  return {
    position,
    livePrice,
    currentValueNative,
    costNative,
    currentValuePLN,
    costPLN,
    pnlPLN,
    pnlPct,
  };
}

export type PortfolioTotals = {
  totalValuePLN: number;
  totalCostPLN: number;
  totalPnlPLN: number;
  totalPnlPct: number;
  byAssetType: Record<string, number>;
};

export function computePortfolioTotals(
  metrics: PositionMetrics[]
): PortfolioTotals {
  let totalValuePLN = 0;
  let totalCostPLN = 0;
  const byAssetType: Record<string, number> = {};

  for (const m of metrics) {
    totalValuePLN += m.currentValuePLN;
    totalCostPLN += m.costPLN;
    const key = m.position.assetType;
    byAssetType[key] = (byAssetType[key] ?? 0) + m.currentValuePLN;
  }

  const totalPnlPLN = totalValuePLN - totalCostPLN;
  const totalPnlPct = totalCostPLN > 0 ? totalPnlPLN / totalCostPLN : 0;

  return {
    totalValuePLN,
    totalCostPLN,
    totalPnlPLN,
    totalPnlPct,
    byAssetType,
  };
}
