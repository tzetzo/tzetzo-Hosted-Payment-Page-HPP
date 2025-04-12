"use client";

import { use, useState, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";
import StatusMessage from "@/components/StatusMessage";
import { QRCode } from "@/components/QRCode";
import CountdownTimer from "@/components/CountdownTimer";
import { useExpiryContext } from "@/context/ExpiryContext";
import { useRequest } from "@/hooks/useRequest";
import { maskString } from "@/helpers/mask-string";
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

  const { data, isLoading, error } = useRequest<PaymentSummary>(
    uuid,
    "GET",
    "summary"
  );

  let setSeconds: (seconds: number) => void;

  useEffect(() => {
    if (!data) {
      // we only call setExpiryDate & setUUID here to redirect to /expired if the expiryDate is in the past
      // ex user tries to go back to the page after the expiry date
      setExpiryDate(1);
      setUUID(uuid);
      return;
    }

    // Set the expiryDate again in case it got changed
    setExpiryDate(data.expiryDate);
    setUUID(uuid);

    const expiryTime = new Date(data.expiryDate).getTime();
    const currentTime = new Date().getTime();
    const timeDifference = expiryTime - currentTime;

    setSeconds(Math.floor(timeDifference / 1000));
  }, [data, setExpiryDate, setUUID, uuid, setSeconds]);

  return (
    <main className="flex h-screen w-full items-center justify-center">
      <Card className="w-full max-w-md mx-auto p-6 rounded-2xl shadow-md bg-white">
        <CardContent className="space-y-6">
          <StatusMessage
            isLoading={isLoading}
            errorMessage={error ? "Error loading payment summary.." : null}
          />
          {!isLoading && !error && (
            <>
              <div className="text-center">
                <h2 className="text-xl font-medium text-gray-600">
                  Pay with{" "}
                  {
                    CurrencyEnum[
                      data?.paidCurrency?.currency as keyof typeof CurrencyEnum
                    ]
                  }
                </h2>

                <div className="text-sm text-gray-500 mt-6">
                  To complete this payment send the amount due to the{" "}
                  {data?.paidCurrency?.currency} address provided below.
                </div>
              </div>

              <div className="text-sm flex justify-between border-t pt-3 border-b pb-3 text-gray-700">
                <span>Amount due</span>
                <div className="space-x-4">
                  <span className="font-semibold">
                    {data?.paidCurrency?.amount} {data?.paidCurrency?.currency}
                  </span>
                  <span
                    className="text-blue-500 cursor-pointer"
                    onClick={() =>
                      copyToClipboard(
                        String(data?.paidCurrency?.amount || ""),
                        setCopiedItem,
                        "amount"
                      )
                    }
                  >
                    {copiedItem === "amount" ? (
                      <span>Copied!</span>
                    ) : (
                      <span>Copy</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="text-sm flex justify-between items-center -mt-2 pb-3 text-gray-700">
                <span>{data?.paidCurrency?.currency} address</span>
                <div className="space-x-4">
                  <span className="font-semibold">
                    {maskString(data?.address?.address || "")}
                  </span>
                  <span
                    className="text-blue-500 cursor-pointer"
                    onClick={() =>
                      copyToClipboard(
                        data?.address?.address || "",
                        setCopiedItem,
                        "address"
                      )
                    }
                  >
                    {copiedItem === "address" ? (
                      <span>Copied!</span>
                    ) : (
                      <span>Copy</span>
                    )}
                  </span>
                </div>
              </div>

              <QRCode value={data?.address?.address || ""} />

              <div className="text-sm flex justify-between border-t pt-3 border-b pb-3 text-gray-700">
                <span>Time left to pay</span>
                <CountdownTimer
                  initialSeconds={0}
                  onSetSeconds={(setter) => {
                    setSeconds = setter;
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
