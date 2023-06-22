export interface HistoricalPos {
    Product: any,
    Position: string,    
    Quantity: number,
    AverageEntryPrice: number,
    AverageExitPrice: number,
    RealizedPL: number,
    NetPL: number,
    EnterDate: Date
    ExitDate: Date
}