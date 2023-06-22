import { Component, OnInit, QueryList, ViewChildren, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HistoricalPos } from 'src/app/interface/historical-pos';
import { HistoricalPosService } from './historicalPos.service';
import { HistoricalPosSortableHeader, HistoricalPosSortEvent } from './sortable.directive';
import { BroadcastService } from 'src/app/common/broadcast.service';
import { TradingService } from '../trading.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'dashboard-historical-pos',
    templateUrl: './dashboard.historicalPos.html',
    styleUrls: ['./dashboard.historicalPos.css'],
    providers: [HistoricalPosService, TradingService, DecimalPipe]
})
export class HistoricalPosComponent implements OnInit {
    @Input() public selectedAccount: any;
    @Input() public modelPortfolio: any;

    @ViewChildren(HistoricalPosSortableHeader)
    headers!: QueryList<HistoricalPosSortableHeader>;

    accountUpdateListener: Subscription | undefined;
    historicals: HistoricalPos[] = [];

    constructor(public service: HistoricalPosService, 
        private tradingService: TradingService,
        public broadcast: BroadcastService) {        
    }

    ngOnInit(): void {
        this.accountUpdateListener = this.broadcast.subscribe("ACCOUNT_SELECTION_UPDATED", (account) => {
            this.tradingService.getHistoricalPositions(account.UserId, this.modelPortfolio.StrategyId).subscribe(result => {
                if (result && result.length > 0) {
                    this.historicals = result;
                    if (this.historicals) {
                        this.service.searchHistoricals(this.historicals);
                    }
                }
            });
        });
        if (this.selectedAccount.UserId) {
            this.tradingService.getHistoricalPositions(this.selectedAccount.UserId, this.modelPortfolio.StrategyId).subscribe(result => {
                if (result && result.length > 0) {
                    this.historicals = result;
                    if (this.historicals) {
                        this.service.searchHistoricals(this.historicals);
                    }
                }
            });    
        }
    }

    ngOnDestroy(): void {
        this.accountUpdateListener?.unsubscribe();
    }

    search() {
        if (this.historicals) {
            this.service.searchHistoricals(this.historicals);
        }
    }

    onSort({ column, direction }: HistoricalPosSortEvent) {
        // resetting other headers
        this.headers.forEach(header => {
            if (header.sortablehistoricalpos !== column) {
                header.directionhistorical = '';
            }
        });

        this.service.sortColumn = column;
        this.service.sortDirection = direction;
    }
    
}