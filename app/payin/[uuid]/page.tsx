"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { formatTime } from "@/app/helpers/format-time";

interface AcceptQuotePageProps {
  params: Promise<{ uuid: string }>;
}

interface UpdatedData {
  paidCurrency?: {
    amount: string;
    currency: string;
  };
  acceptanceExpiryDate?: string;
}

export default function AcceptQuotePage({ params }: AcceptQuotePageProps) {
  const { uuid } = use(params);
  const router = useRouter();

  const [seconds, setSeconds] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const [updatedData, setUpdatedData] = useState<UpdatedData | null>(null);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>("Confirm");

  const { data, isLoading, error } = useQuery({
    queryKey: ["paymentSummary", uuid],
    queryFn: async () => {
      const response = await axios.get(
        `https://api.sandbox.bvnk.com/api/v1/pay/${uuid}/summary`
      );
      return response.data;
    },
    enabled: !!uuid, // Only fetch if uuid is available
  });

  const updateSummaryMutation = useMutation({
    mutationFn: async (currency: string) => {
      const response = await axios.put(
        `https://api.sandbox.bvnk.com/api/v1/pay/${uuid}/update/summary`,
        {
          currency,
          payInMethod: "crypto",
        }
      );

      return response.data;
    },
    onSuccess: (data: UpdatedData) => {
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
            updateSummaryMutation.mutate(selectedCurrency || "");
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
        error.response.data.code === "MER-PAY-2017"
      ) {
        console.warn("Payment already expired");
        router.push(`/payin/${uuid}/expired`);
      }
    },
  });

  useEffect(() => {
    if (seconds === 0) return;
    const timer = setInterval(
      () => setSeconds((prev) => Math.max(0, prev - 1)),
      1000
    );
    return () => clearInterval(timer);
  }, [seconds]);

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    updateSummaryMutation.mutate(currency);
  };

  const handleConfirm = async () => {
    try {
      setButtonDisabled(true);
      setButtonText("Processing...");
      await axios.put(
        `https://api.sandbox.bvnk.com/api/v1/pay/${uuid}/accept/summary`,
        {
          successUrl: "no_url",
        }
      );
      router.push(`/payin/${uuid}/pay`);
    } catch (error) {
      console.error("Error confirming payment:", error);
    }
  };

  return (
    <main className="flex h-screen w-full items-center justify-center">
      <Card className="w-full max-w-md mx-auto p-6 rounded-2xl shadow-md bg-white">
        <CardContent className="space-y-6">
          {isLoading && (
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-600">Loading...</h2>
              <div className="mt-4 flex justify-center">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            </div>
          )}
          {error && (
            <div className="text-center">
              <h2 className="text-lg font-medium text-red-600">
                Error loading payment summary
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Please try again later.
              </p>
            </div>
          )}
          {!isLoading && !error && (
            <>
              <div className="text-center">
                <h2 className="text-xl font-medium text-gray-600">
                  {data?.merchantDisplayName || "Merchant Display Name"}
                </h2>
                <div className="text-4xl font-bold text-gray-900 mt-1">
                  {data.displayCurrency.amount}{" "}
                  <span className="text-lg font-semibold">
                    {data.displayCurrency.currency}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-6">
                  For reference number:{" "}
                  <span className="font-semibold text-gray-700">
                    {data.reference}
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
                    <SelectItem value="BTC">Bitcoin</SelectItem>
                    <SelectItem value="ETH">Ethereum</SelectItem>
                    <SelectItem value="LTC">Litecoin</SelectItem>
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
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
