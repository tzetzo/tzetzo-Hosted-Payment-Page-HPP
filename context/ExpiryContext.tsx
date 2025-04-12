"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ExpiryContextType {
  expiryDate: number;
  setExpiryDate: (date: number) => void;
  setUUID: (uuid: string) => void;
}

const ExpiryContext = createContext<ExpiryContextType | undefined>(undefined);

export const ExpiryProvider = ({ children }: { children: React.ReactNode }) => {
  const [expiryDate, setExpiryDate] = useState<number>(0);
  const [uuid, setUUID] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (!expiryDate) return;

    const expiryTime = new Date(expiryDate).getTime();
    const currentTime = new Date().getTime();
    const timeDifference = expiryTime - currentTime;

    if (timeDifference <= 0) {
      router.push(`/payin/${uuid}/expired`);
      return;
    }

    const timer = setTimeout(() => {
      router.push(`/payin/${uuid}/expired`);
    }, timeDifference);

    return () => clearTimeout(timer);
  }, [expiryDate, router]);

  return (
    <ExpiryContext.Provider value={{ expiryDate, setExpiryDate, setUUID }}>
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
