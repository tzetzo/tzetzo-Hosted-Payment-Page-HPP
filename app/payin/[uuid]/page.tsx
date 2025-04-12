"use client";

import { use, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatusMessage from "@/components/StatusMessage";
import { useExpiryContext } from "@/context/ExpiryContext";
import { useCountdownTimer } from "@/hooks/useCountdownTimer";
import { useRequest } from "@/hooks/useRequest";
import { formatTime } from "@/helpers/format-time";
import { CurrencyEnum, CurrencyCode } from "@/constants/currencyEnum";
import { PaymentSummary } from "@/types/payment";

interface AcceptQuotePageProps {
  params: Promise<{ uuid: string }>;
}

export default function AcceptQuotePage({ params }: AcceptQuotePageProps) {
  const { uuid } = use(params);
  const router = useRouter();
  const [seconds, setSeconds] = useCountdownTimer(0);

  const { setExpiryDate, setUUID } = useExpiryContext();

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);

  const [updatedData, setUpdatedData] = useState<PaymentSummary | null>(null);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<"Confirm" | "Processing...">(
    "Confirm"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, isLoading, error } = useRequest<PaymentSummary>(
    uuid,
    "GET",
    "summary"
  );

  useEffect(() => {
    if (data?.expiryDate) {
      // We set the expiryDate here to redirect to /expired if the expiryDate is in the past
      // The expiryDate remains consistent when making '/${uuid}/summary' request from both '<DOMAIN>/payin/<UUID>' and '<DOMAIN>/payin/<UUID>/pay' pages
      setExpiryDate(data.expiryDate);
      setUUID(uuid);
    }
  }, [data, setExpiryDate, setUUID, uuid]);

  const updateSummaryMutation = useMutation({
    mutationFn: async (currency: CurrencyCode) => {
      const response = await axios.put(
        `https://api.sandbox.bvnk.com/api/v1/pay/${uuid}/update/summary`,
        {
          currency,
          payInMethod: "crypto",
        }
      );
      return response.data;
    },
    onSuccess: (data: PaymentSummary) => {
      setUpdatedData(data);
      setShowDetails(true);

      if (data.acceptanceExpiryDate) {
        const expiryDate =
          new Date(data.acceptanceExpiryDate).getTime() -
          new Date().getTimezoneOffset();
        const currentTime = new Date().getTime();
        const timeDifference = Math.max(
          0,
          Math.floor((expiryDate - currentTime) / 1000)
        );
        setSeconds(timeDifference);

        if (timeDifference > 0) {
          setTimeout(() => {
            if (selectedCurrency) {
              updateSummaryMutation.mutate(selectedCurrency);
            } else {
              console.error("No currency selected");
            }
          }, timeDifference * 1000);
        }
      } else {
        console.error("Invalid or missing acceptanceExpiryDate");
        setSeconds(0);
      }
    },
    onError: (error: unknown) => {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 400 &&
        error.response?.data &&
        error.response.data.code === "MER-PAY-2003"
      ) {
        setErrorMessage(error.response.data.message);
        setTimeout(() => {
          router.push(`/payin/${uuid}/pay`);
        }, 3000);
      } else {
        setErrorMessage("Error updating payment summary. Please try again.");
      }
    },
  });

  const handleCurrencyChange = (currency: CurrencyCode) => {
    setSelectedCurrency(currency);
    updateSummaryMutation.mutate(currency);
  };

  const handleConfirm = async () => {
    try {
      setButtonDisabled(true);
      setButtonText("Processing...");
      const { data }: { data: { quoteStatus: string } } = await axios.put(
        `https://api.sandbox.bvnk.com/api/v1/pay/${uuid}/accept/summary`,
        {
          successUrl: "no_url",
        }
      );

      if (data.quoteStatus === "ACCEPTED") {
        router.push(`/payin/${uuid}/pay`);
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      setErrorMessage("Error confirming payment. Please try again.");
      setButtonDisabled(false);
      setButtonText("Confirm");
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center">
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
                  {data?.merchantDisplayName || "Merchant Display Name"}
                </h2>
                <div className="text-4xl font-bold text-gray-900 mt-1">
                  {data?.displayCurrency.amount}{" "}
                  <span className="text-lg font-semibold">
                    {data?.displayCurrency.currency}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-6">
                  For reference number:{" "}
                  <span className="font-semibold text-gray-700">
                    {data?.reference}
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

              {showDetails && updatedData && (
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
                    disabled={buttonDisabled}
                  >
                    {buttonText}
                  </Button>
                </>
              )}

              {errorMessage && (
                <div className="text-center text-red-600 bg-red-100 p-3 rounded-md mb-4">
                  {errorMessage}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
