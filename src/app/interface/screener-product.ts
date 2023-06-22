export interface ScreenerProduct {
    ProductId: number,
    Symbol: string,
    Name: string,
    Currency: string,
    LotSize: number,
    ProductIconURL: string,
    AskPrice: number,
    BidPrice: number,
    BidSize: number,
    AskSize: number,
    LastTradedPrice: number,
    TodayOpen: number,
    PrevClose: number,
    Change: number,
    PctChange: number,
    CumulativeVolume: number
}