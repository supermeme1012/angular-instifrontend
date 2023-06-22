import { Component, OnInit, QueryList, ViewChildren, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Historical } from 'src/app/interface/historical';
import { HistoricalService } from './historical.service';
import { HistoricalSortableHeader, HistoricalSortEvent } from './sortable.directive';
import { BroadcastService } from 'src/app/common/broadcast.service';


@Component({
    selector: 'dashboard-historical',
    templateUrl: './dashboard.historical.html',
    styleUrls: ['./dashboard.historical.css'],
    providers: [HistoricalService, DecimalPipe]
})
export class HistoricalComponent implements OnInit {
    @Input() public selectedAccount: any;

    @ViewChildren(HistoricalSortableHeader)
    headers!: QueryList<HistoricalSortableHeader>;

    historicals: Historical[] = [];

    constructor(public service: HistoricalService, private broadcast: BroadcastService) {
        // subscribe to broadcast event
        this.broadcast.subscribe("HISTORICAL_LOGS_UPDATED", (historicals) => {
            this.historicals = historicals;
            this.search();
        });
    }

    ngOnInit(): void {
    }

    search() {
        if (this.historicals) {
            this.service.searchHistoricals(this.historicals);
        }
    }

    onSort({ column, direction }: HistoricalSortEvent) {
        // resetting other headers
        this.headers.forEach(header => {
            if (header.sortablehistorical !== column) {
                header.directionhistorical = '';
            }
        });

        this.service.sortColumn = column;
        this.service.sortDirection = direction;
    }
    
}