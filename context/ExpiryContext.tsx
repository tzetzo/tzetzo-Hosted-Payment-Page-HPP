"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ExpiryContextType {
  expiryDate: number;
  setExpiryDate: (date: number) => void;
  setUUID: (uuid: string) => void;
  accepted: boolean;
  setAccepted: (accepted: boolean) => void;
}

const ExpiryContext = createContext<ExpiryContextType | undefined>(undefined);

export const ExpiryProvider = ({ children }: { children: React.ReactNode }) => {
  const [expiryDate, setExpiryDate] = useState<number>(0);
  const [uuid, setUUID] = useState<string>("");
  const router = useRouter();
  const [accepted, setAcceptedState] = useState<boolean>(false);

  // Initialize `accepted` state on the client side
  useEffect(() => {
    const storedAccepted = localStorage.getItem("accepted");
    if (storedAccepted === "true") {
      setAcceptedState(true);
    }
  }, []);

  const setAccepted = (value: boolean) => {
    setAcceptedState(value);
    localStorage.setItem("accepted", value.toString());
  };

  useEffect(() => {
    if (!expiryDate) return;

    const expiryTime = new Date(expiryDate).getTime();
    const currentTime = new Date().getTime();
    const timeDifference = expiryTime - currentTime;

    if (timeDifference <= 0) {
      setAccepted(false);
      router.push(`/payin/${uuid}/expired`);
      return;
    }

    const timer = setTimeout(() => {
      setAccepted(false);
      router.push(`/payin/${uuid}/expired`);
    }, timeDifference);

    return () => clearTimeout(timer);
  }, [expiryDate, router, uuid]);

  return (
    <ExpiryContext.Provider
      value={{ expiryDate, setExpiryDate, setUUID, accepted, setAccepted }}
    >
      {children}
    </ExpiryContext.Provider>
  );
};

export const useExpiryContext = () => {
  const context = useContext(ExpiryContext);
  if (!context) {
    throw new Error("useExpiryContext must be used within an ExpiryProvider");
  }
  return context;
};
