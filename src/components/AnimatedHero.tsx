"use client";

import { AnimatedNumber } from "./AnimatedNumber";

const NUMBER_FORMAT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function AnimatedHero({ value }: { value: number }) {
  return (
    <span className="tabular text-5xl font-medium leading-none tracking-tight sm:text-6xl md:text-[64px]">
      <AnimatedNumber value={value} format={(v) => NUMBER_FORMAT.format(v)} />
    </span>
  );
}
