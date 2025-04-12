"use client";

import React, { use, useState, useEffect, useRef } from "react";

import { Card, CardContent } from "@/components/ui/card";
import StatusMessage from "@/components/StatusMessage";
import { QRCode } from "@/components/QRCode";
import CountdownTimer from "@/components/CountdownTimer";
import AmountDue from "@/components/AmountDue";
import AddressDetails from "@/components/AddressDetails";
import { useExpiryContext } from "@/context/ExpiryContext";
import { useRequest } from "@/hooks/useRequest";
import { copyToClipboard } from "@/helpers/copy-to-clipboard";
import { CurrencyEnum } from "@/constants/currencyEnum";
import { PaymentSummary } from "@/types/payment";

interface PayQuotePageProps {
  params: Promise<{ uuid: string }>;
}

export default function PayQuotePage({ params }: PayQuotePageProps) {
  const { uuid } = use(params);
  const { setExpiryDate, setUUID } = useExpiryContext();
  const [copiedItem, setCopiedItem] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: paymentSummary,
    isLoading,
    error,
  } = useRequest<PaymentSummary>(uuid, "GET", "summary");

  useEffect(() => {
    if (
      error &&
      axios.isAxiosError(error) &&
      error.response?.status === 400 &&
      error.response?.data &&
      error.response.data?.errorList
    ) {
      console.log(error.response.data.errorList[0].message);
      setErrorMessage(error.response.data.errorList[0].message);
    }
  }, [error]);

  const setSecondsRef = useRef<(seconds: number) => void>();

  useEffect(() => {
    if (!paymentSummary) {
      // we only call setExpiryDate & setUUID here to redirect to /expired if the expiryDate is in the past
      // ex user tries to go back to the page after the expiry date
      setExpiryDate(1);
      setUUID(uuid);
      return;
    }

    // Set the expiryDate again in case it got changed
    setExpiryDate(paymentSummary.expiryDate);
    setUUID(uuid);

    const expiryTime = new Date(paymentSummary.expiryDate).getTime();
    const currentTime = new Date().getTime();
    const timeDifference = expiryTime - currentTime;

    setSecondsRef.current?.(Math.floor(timeDifference / 1000));
  }, [paymentSummary, setExpiryDate, setUUID, uuid]);

  const handleCopy = (value: string, type: string) => {
    copyToClipboard(value, setCopiedItem, type);
  };

  return (
    <main className="flex h-screen w-full items-center justify-center">
      <Card className="w-full max-w-md mx-auto p-6 rounded-2xl shadow-md bg-white">
        <CardContent className="space-y-6">
          <StatusMessage
            isLoading={isLoading}
            errorMessage={errorMessage ? errorMessage : null}
          />
          {!isLoading && !error && paymentSummary && (
            <>
              <PaymentHeader paymentSummary={paymentSummary} />

              <AmountDue
                amount={paymentSummary.paidCurrency?.amount}
                currency={paymentSummary.paidCurrency?.currency}
                onCopy={handleCopy}
                copiedItem={copiedItem}
              />

              <AddressDetails
                address={paymentSummary.address?.address}
                currency={paymentSummary.paidCurrency?.currency}
                onCopy={handleCopy}
                copiedItem={copiedItem}
              />

              <QRCode value={paymentSummary.address?.address || ""} />

              <div className="text-sm flex justify-between border-t pt-3 border-b pb-3 text-gray-700">
                <span>Time left to pay</span>
                <CountdownTimer
                  initialSeconds={0}
                  onSetSeconds={(setter) => {
                    setSecondsRef.current = setter;
                  }}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

const PaymentHeader = React.memo(
  ({ paymentSummary }: { paymentSummary: PaymentSummary }) => (
    <div className="text-center">
      <h2 className="text-xl font-medium text-gray-600">
        Pay with{" "}
        {
          CurrencyEnum[
            paymentSummary.paidCurrency.currency as keyof typeof CurrencyEnum
          ]
        }
      </h2>
      <div className="text-sm text-gray-500 mt-6">
        To complete this payment send the amount due to the{" "}
        {paymentSummary.paidCurrency.currency} address provided below.
      </div>
    </div>
  )
);

PaymentHeader.displayName = "PaymentHeader";
