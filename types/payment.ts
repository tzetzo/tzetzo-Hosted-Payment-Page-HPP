export interface PaymentSummary {
  expiryDate: number;
  paidCurrency: {
    amount: number;
    currency: string;
  };
  acceptanceExpiryDate?: string;
  address: {
    address: string;
  };
  merchantDisplayName: string;
  displayCurrency: {
    amount: number;
    currency: string;
  };
  reference: string;
}
