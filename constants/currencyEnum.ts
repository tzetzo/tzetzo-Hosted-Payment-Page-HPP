export enum CurrencyEnum {
  BTC = "Bitcoin",
  ETH = "Ethereum",
  LTC = "Litecoin",
}

export type CurrencyCode = keyof typeof CurrencyEnum;
