"use client";

import { useState } from "react";
import { PositionForm } from "./PositionForm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function AddPositionButton() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)]"
        >
          <Plus className="size-3.5" />
          Add position
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl">
            New position
          </SheetTitle>
          <SheetDescription>
            Enter a stock, ETF, crypto or cash holding you already own.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 px-4">
          <PositionForm onSuccess={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
