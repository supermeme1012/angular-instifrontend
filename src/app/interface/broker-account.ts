export interface BrokerAccount {
    AccountNumber: string;
    AccountType: string;
    Currency: string;
    Equity: number;
    Fund: number;
    Margin: number;
    Available: number;
    BrokerType: string;
    MaxLongAlloc: number;
    MaxShortAlloc: number;
  }