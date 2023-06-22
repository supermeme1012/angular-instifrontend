import { Component, OnInit, QueryList, ViewChildren, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DecimalPipe } from '@angular/common';
import { PositionService } from './position.service';
import { PositionSortableHeader, PositionSortEvent } from './sortable.directive';
import { CloseModal } from '../close-position/dashboard.close';
import { BroadcastService } from 'src/app/common/broadcast.service';
import { Position } from 'src/app/interface/position';
import { SignalRService } from 'src/app/common/signalr.service';


@Component({
    selector: 'dashboard-position',
    templateUrl: './dashboard.position.html',
    styleUrls: ['./dashboard.position.css'],
    providers: [PositionService, DecimalPipe]
})
export class PositionComponent implements OnInit {
    @Input() public selectedAccount: any;
    @Input() public modelPortfolio: any;

    @ViewChildren(PositionSortableHeader)
    headers!: QueryList<PositionSortableHeader>;

    positions: Position[] = [];

    constructor(public service: PositionService,
        private modalService: NgbModal,
        private broadcast: BroadcastService,
        private signalR: SignalRService
    ) {
        // subscribe to broadcast event
        this.broadcast.subscribe("POSITIONS_UPDATED", (positions) => {
            // unsubscribe old products
            if (this.positions && this.positions.length > 0) {
                this.signalR.unsubscribeMarketData(this.positions.map(p => p.ProductId), "US");
            }
            // subscribe to new products
            this.positions = positions;
            this.signalR.subscribeToMarketData(this.positions.map(p => p.ProductId), "US", this.onMarketDataUpdate.bind(this));
            this.search();
        });
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        if (this.positions && this.positions.length > 0) {
            this.signalR.unsubscribeMarketData(this.positions.map(p => p.ProductId), "US");
        }
    }

    search() {
        if (this.positions) {
            this.service.searchPositions(this.positions);
        }
    }

    onSort({ column, direction }: PositionSortEvent) {
        // resetting other headers
        this.headers.forEach(header => {
            if (header.sortableposition !== column) {
                header.directionposition = '';
            }
        });

        this.service.sortColumn = column;
        this.service.sortDirection = direction;
    }

    close(position: Position) {
        const modalRef = this.modalService.open(CloseModal);
        modalRef.componentInstance.account = this.selectedAccount;
        modalRef.componentInstance.modelPortfolio = this.modelPortfolio;
        modalRef.componentInstance.productId = position.ProductId;
        modalRef.componentInstance.symbol = position.Symbol;
        modalRef.componentInstance.productName = position.ProductName;
        modalRef.componentInstance.position = position.Position;
        modalRef.componentInstance.quantity = position.Quantity;
        modalRef.componentInstance.currency = position.Currency;
    }

    private onMarketDataUpdate(data: any) {
        if (this.positions && this.positions.length > 0) {
            for (var position of this.positions) {
                if (data.Symbol === position.Symbol && data.LastTradedPrice) {
                    if (position.Position.toLowerCase() === "long") {
                        position.UnrealizedPL = (data.LastTradedPrice - position.AvgEntryPrice) * position.Quantity;
                    } else {
                        position.UnrealizedPL = (position.AvgEntryPrice - data.LastTradedPrice) * position.Quantity;
                    }
                }
            }
        }
    }
}