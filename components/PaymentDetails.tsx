import React from "react";

import { PaymentSummary } from "@/types/payment";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/helpers/format-time";

interface PaymentDetailsProps {
  updatedData: PaymentSummary | null;
  seconds: number;
  buttonDisabled: boolean;
  buttonText: string;
  handleConfirm: () => void;
  updateSummaryMutation: {
    isPending: boolean;
  };
}

const PaymentDetails = React.memo(
  ({
    updatedData,
    seconds,
    buttonDisabled,
    buttonText,
    handleConfirm,
    updateSummaryMutation,
  }: PaymentDetailsProps) => (
    <>
      <div className="text-sm flex justify-between border-t pt-3 border-b pb-3 text-gray-700">
        <span>Amount due</span>
        {updateSummaryMutation.isPending ? (
          <div className="w-4 h-4 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
        ) : (
          <span className="font-semibold">
            {updatedData?.paidCurrency?.amount}{" "}
            {updatedData?.paidCurrency?.currency}
          </span>
        )}
      </div>
      <div className="text-sm flex justify-between -mt-2 border-b pb-3 text-gray-700">
        <span>Quoted price expires in</span>
        {updateSummaryMutation.isPending ? (
          <div className="w-4 h-4 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
        ) : (
          <span className="font-mono">{formatTime(seconds)}</span>
        )}
      </div>
      <Button
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm cursor-pointer"
        onClick={handleConfirm}
        disabled={buttonDisabled || updateSummaryMutation.isPending}
      >
        {buttonText}
      </Button>
    </>
  )
);

PaymentDetails.displayName = "PaymentDetails";

export default PaymentDetails;
