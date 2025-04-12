import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function PaymentExpiredCard() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="w-full max-w-md mx-auto p-12 rounded-2xl shadow-md bg-white text-center">
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center">
            <Image
              src="/alert.svg"
              alt="Error Icon"
              width={60}
              height={60}
              priority
            />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Payment details expired
          </h2>
          <p className="text-muted-foreground">
            The payment details for your transaction have expired.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
