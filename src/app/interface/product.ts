export interface Product {
    ProductId: number,
    Symbol: string,
    ProductName: string,
    Currency: string,
    TradeVenueLoc: string,
    LotSize: number,
    ProductIconURL: string,
    Ask: number,
    Bid: number,
    BidVol: number,
    AskVol: number,
    Last: number,
    TodayOpen: number,
    LastClose: number,
    Change: number,
    ChangePct: number,
    Volume: number
}