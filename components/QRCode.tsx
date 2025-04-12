// components/QRCode.tsx
"use client";

import { QRCodeCanvas } from "qrcode.react";
import { cn } from "@/lib/utils";

type QRCodeProps = {
  value: string;
  className?: string;
};

export function QRCode({ value, className }: QRCodeProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <QRCodeCanvas
        value={value}
        size={160}
        bgColor="transparent"
        fgColor="#0F172A" // Slate-900
        level="H"
        includeMargin
      />
      <p className="text-sm text-slate-600 break-all text-center max-w-xs">
        {value}
      </p>
    </div>
  );
}
