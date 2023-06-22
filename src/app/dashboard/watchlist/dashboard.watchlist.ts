import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { ScreenerProduct } from 'src/app/interface/screener-product';
import { WatchlistService } from './watchlist.service';
import { WatchlistListSortableHeader, WatchlistListSortEvent } from './sortable.directive';
import { SignalRService } from 'src/app/common/signalr.service';


@Component({
    selector: 'dashboard-watchlist',
    templateUrl: './dashboard.watchlist.html',
    styleUrls: ['./dashboard.watchlist.css'],
    providers: [WatchlistService, DecimalPipe]
})
export class WatchlistComponent implements OnInit {
    products: ScreenerProduct[] = [];
    total$: Observable<number>;

    @ViewChildren(WatchlistListSortableHeader)
    headers!: QueryList<WatchlistListSortableHeader>;

    constructor(public service: WatchlistService,
        private signalR: SignalRService
    ) {
        this.service.searchProduct(true);
        this.total$ = service.total$;
        service.products$.subscribe(result => {
            if (result && result.length > 0) {
                // unsubscribe old products
                if (this.products && this.products.length > 0) {
                    this.signalR.unsubscribeMarketData(this.products.map(p => p.ProductId), "US");
                }
                // subscribe to new products
                this.products = result;
                this.signalR.subscribeToMarketData(this.products.map(p => p.ProductId), "US", this.onMarketDataUpdate.bind(this));
            }
        });
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        if (this.products && this.products.length > 0) {
            this.signalR.unsubscribeMarketData(this.products.map(p => p.ProductId), "US");
        }
    }

    onSort({ column, direction }: WatchlistListSortEvent) {
        // resetting other headers
        this.headers.forEach(header => {
            if (header.sortablewatchlist !== column) {
                header.directionwatchlist = '';
            }
        });

        this.service.sortColumn = column;
        this.service.sortDirection = direction;
    }

    private onMarketDataUpdate(data: any) {
        if (this.products && this.products.length > 0) {
            for (var product of this.products) {
                if (data.Symbol === product.Symbol && data.LastTradedPrice) {
                    product.LastTradedPrice = data.LastTradedPrice;
                }
                if (data.Symbol === product.Symbol && data.BidPrice) {
                    product.BidPrice = data.BidPrice;
                    product.BidSize = data.BidSize;
                }
                if (data.Symbol === product.Symbol && data.AskPrice) {
                    product.AskPrice = data.AskPrice;
                    product.AskSize = data.AskSize;
                }
                product.Change = product.LastTradedPrice - product.PrevClose;
                if (product.PrevClose > 0) {
                    product.PctChange = product.Change / product.PrevClose;
                }
            }
        }
    }
}