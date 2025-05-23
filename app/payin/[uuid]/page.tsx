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
import { CurrencyCode } from "@/constants/currencyEnum";
import { PaymentSummary } from "@/types/payment";

interface AcceptQuotePageProps {
  params: Promise<{ uuid: string }>;
}

export default function AcceptQuotePage({ params }: AcceptQuotePageProps) {
  const { uuid } = use(params);
  const router = useRouter();
  const [seconds, setSeconds] = useCountdownTimer(0);

  const { setExpiryDate, setUUID, accepted, setAccepted } = useExpiryContext();

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
    isLoading: paymentSummaryIsLoading,
    error: paymentSummaryError,
  } = useRequest(uuid, "GET", "summary");

  // Redirect to PayQuotePage if the user revisits and expiryDate is still valid
  useEffect(() => {
    if (accepted) {
      const expiryTime = new Date(paymentSummary?.expiryDate ?? 0).getTime();
      const currentTime = new Date().getTime();
      if (expiryTime > currentTime) {
        router.push(`/payin/${uuid}/pay`);
      }
    }
  }, [accepted, router, uuid, paymentSummary]);

  useEffect(() => {
    if (paymentSummaryError) {
      setErrorMessage("Error fetching payment summary.");
    }
  }, [paymentSummaryError]);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (paymentSummary?.expiryDate) {
      // Set the expiryDate to handle redirection to the /expired page when the expiryDate has already passed.
      // With the current backend api implementation the expiryDate is consistent when fetching the data from '/${uuid}/summary' in both '<DOMAIN>/payin/<UUID>' and '<DOMAIN>/payin/<UUID>/pay' pages.
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
    onSuccess: (data) => {
      handleUpdateSummarySuccess(data);
    },
    onError: () => {
      setErrorMessage("Error updating payment summary.");
    },
  });

  const handleUpdateSummarySuccess = (data: PaymentSummary) => {
    setUpdatedData(data);

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

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

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

  const handleCurrencyChange = (currency: CurrencyCode) => {
    setShowDetails(true);
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
        setAccepted(true);
        router.push(`/payin/${uuid}/pay`);
      }
    } catch {
      setErrorMessage("Error confirming payment.");
      setButtonDisabled(false);
      setButtonText("Confirm");
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Card className="w-full max-w-md mx-auto p-6 rounded-2xl shadow-md bg-white">
        <CardContent
          className={`space-y-6 overflow-hidden transition-all duration-500 ease-in-out ${
            showDetails ? "max-h-[430px]" : "max-h-[251px]"
          }`}
        >
          <StatusMessage
            isLoading={paymentSummaryIsLoading}
            errorMessage={errorMessage ? errorMessage : null}
          />
          {!paymentSummaryIsLoading && !errorMessage && (
            <>
              <PaymentSummaryDetails
                paymentSummary={paymentSummary ?? null}
                handleCurrencyChange={handleCurrencyChange}
              />

              {showDetails && (
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
