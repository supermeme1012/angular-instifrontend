export interface Position {
  ProductId: number,
  Symbol: string,
  TradeVenueLoc: string,
  ProductName: string,
  Position: string,
  Quantity: number,
  Allocation: number,
  AvgEntryPrice: number,
  Currency: string,
  UnrealizedPL: number,
  EntryDate: Date
  HasAlgoPosition: boolean
}