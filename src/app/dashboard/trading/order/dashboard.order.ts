import { Component, OnInit, QueryList, ViewChildren, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActiveOrder } from 'src/app/interface/active-order';
import { OrderService } from './order.service';
import { OrderSortableHeader, OrderSortEvent } from './sortable.directive';
import { BroadcastService } from 'src/app/common/broadcast.service';
import { CancelOrderModal } from '../cancel-order/dashboard.cancel-order';


@Component({
    selector: 'dashboard-order',
    templateUrl: './dashboard.order.html',
    styleUrls: ['./dashboard.order.css'],
    providers: [OrderService, DecimalPipe]
})
export class OrderComponent implements OnInit {
    @Input() public selectedAccount: any;

    @ViewChildren(OrderSortableHeader)
    headers!: QueryList<OrderSortableHeader>;

    activeOrders: ActiveOrder[] = [];

    constructor(public service: OrderService,
        private modalService: NgbModal,
        private broadcast: BroadcastService
    ) {
        // subscribe to broadcast event
        this.broadcast.subscribe("ACTIVE_ORDERS_UPDATED", (orders) => {
            this.activeOrders = orders;
            this.search();
        });
    }

    ngOnInit(): void {
    }

    search() {
        if (this.activeOrders) {
            this.service.searchOrders(this.activeOrders);
        }
    }

    onSort({ column, direction }: OrderSortEvent) {
        // resetting other headers
        this.headers.forEach(header => {
            if (header.sortableorder !== column) {
                header.directionorder = '';
            }
        });

        this.service.sortColumn = column;
        this.service.sortDirection = direction;
    }

    cancel(order: ActiveOrder) {
        const modalRef = this.modalService.open(CancelOrderModal);
        modalRef.componentInstance.userId = this.selectedAccount.UserId;
        modalRef.componentInstance.orderId = order.OrderId
    }

}