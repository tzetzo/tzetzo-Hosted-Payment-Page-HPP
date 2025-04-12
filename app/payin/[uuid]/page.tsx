"use client";

import React, { use, useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import PaymentSummaryDetails from "@/components/PaymentSummaryDetails";
import PaymentDetails from "@/components/PaymentDetails";
import StatusMessage from "@/components/StatusMessage";
import { useExpiryContext } from "@/context/ExpiryContext";
import { useCountdownTimer } from "@/hooks/useCountdownTimer";
import { useRequest } from "@/hooks/useRequest";
import { formatTime } from "@/helpers/format-time";
import { CurrencyCode } from "@/constants/currencyEnum";
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

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (paymentSummary?.expiryDate) {
      // We set the expiryDate here to redirect to /expired if the expiryDate is in the past
      // The expiryDate remains consistent when making '/${uuid}/summary' request from both '<DOMAIN>/payin/<UUID>' and '<DOMAIN>/payin/<UUID>/pay' pages
      setExpiryDate(paymentSummary.expiryDate);
      setUUID(uuid);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [paymentSummary, setExpiryDate, setUUID, uuid]);

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
      handleUpdateSummarySuccess(data);
    },
    onError: (error: unknown) => {
      handleUpdateSummaryError(error);
    },
  });

  const handleUpdateSummarySuccess = (data: PaymentSummary) => {
    setUpdatedData(data);
    setShowDetails(true);

    if (data.acceptanceExpiryDate) {
      const expiryTime =
        new Date(data.acceptanceExpiryDate).getTime() -
        new Date().getTimezoneOffset();
      const currentTime = new Date().getTime();
      const timeDifference = Math.max(
        0,
        Math.floor((expiryTime - currentTime) / 1000)
      );
      setSeconds(timeDifference);

      if (timeDifference > 0) {
        timeoutRef.current = setTimeout(() => {
          if (selectedCurrency) {
            updateSummaryMutation.mutate(selectedCurrency);
          } else {
            setErrorMessage("No currency selected");
          }
        }, timeDifference * 1000);
      }
    } else {
      setErrorMessage("Invalid or missing acceptanceExpiryDate");
      setSeconds(0);
    }
  };

  const handleUpdateSummaryError = (error: unknown) => {
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
      setErrorMessage("Error updating payment summary.");
    }
  };

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
      setErrorMessage("Error confirming payment.");
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
            errorMessage={errorMessage ? errorMessage : null}
          />
          {!isLoading && !errorMessage && (
            <>
              <PaymentSummaryDetails
                paymentSummary={paymentSummary}
                handleCurrencyChange={handleCurrencyChange}
              />

              {showDetails && updatedData && (
                <PaymentDetails
                  updatedData={updatedData}
                  seconds={seconds}
                  buttonDisabled={buttonDisabled}
                  buttonText={buttonText}
                  handleConfirm={handleConfirm}
                  updateSummaryMutation={updateSummaryMutation}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
