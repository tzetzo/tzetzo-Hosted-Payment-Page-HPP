import React from "react";

interface AmountDueProps {
  amount: number;
  currency: string;
  onCopy: (value: string, type: string) => void;
  copiedItem: string;
}

const AmountDue = React.memo(
  ({ amount, currency, onCopy, copiedItem }: AmountDueProps) => (
    <div className="text-sm flex justify-between border-t pt-3 border-b pb-3 text-gray-700">
      <span>Amount due</span>
      <div className="space-x-4">
        <span className="font-semibold">
          {amount} {currency}
        </span>
        <span
          className="text-blue-500 cursor-pointer inline-block w-[45px] text-right"
          onClick={() => onCopy(String(amount), "amount")}
        >
          {copiedItem === "amount" ? "Copied!" : "Copy"}
        </span>
      </div>
    </div>
  )
);

AmountDue.displayName = "AmountDue";

export default AmountDue;
