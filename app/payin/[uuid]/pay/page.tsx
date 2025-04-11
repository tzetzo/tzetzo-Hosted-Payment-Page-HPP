import { use } from "react";

interface PayQuotePageProps {
  params: Promise<{ uuid: string }>;
}

export default function PayQuotePage({ params }: PayQuotePageProps) {
  const { uuid } = use(params);

  return <div>Paying for UUID: {uuid}</div>;
}
