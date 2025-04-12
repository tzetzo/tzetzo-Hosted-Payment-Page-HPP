import React from "react";

import { PaymentSummary } from "@/types/payment";
import { CurrencyEnum, CurrencyCode } from "@/constants/currencyEnum";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentSummaryDetailsProps {
  paymentSummary: PaymentSummary | null;
  handleCurrencyChange: (currency: CurrencyCode) => void;
}

const PaymentSummaryDetails = React.memo(
  ({ paymentSummary, handleCurrencyChange }: PaymentSummaryDetailsProps) => (
    <div>
      <div className="text-center">
        <h2 className="text-xl font-medium text-gray-600">
          {paymentSummary?.merchantDisplayName || "Merchant Display Name"}
        </h2>
        <div className="text-4xl font-bold text-gray-900 mt-1">
          {paymentSummary?.displayCurrency.amount}{" "}
          <span className="text-lg font-semibold">
            {paymentSummary?.displayCurrency.currency}
          </span>
        </div>
        <div className="text-sm text-gray-500 mt-6">
          For reference number:{" "}
          <span className="font-semibold text-gray-700">
            {paymentSummary?.reference}
          </span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pay with
        </label>
        <Select onValueChange={handleCurrencyChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CurrencyEnum).map(([code, name]) => (
              <SelectItem key={code} value={code}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
);

PaymentSummaryDetails.displayName = "PaymentSummaryDetails";

export default PaymentSummaryDetails;
