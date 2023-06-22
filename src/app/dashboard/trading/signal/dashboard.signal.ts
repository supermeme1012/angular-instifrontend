import { Component, OnInit, QueryList, ViewChildren, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Signal } from 'src/app/interface/signal';
import { SignalService } from './signal.service';
import { SignalSortableHeader, SignalSortEvent } from './sortable.directive';
import { BroadcastService } from 'src/app/common/broadcast.service';
import { CancelSignalModal } from '../cancel-signal/dashboard.cancel-signal';
import { FollowSignalModal } from '../follow-signal/dashboard.follow-signal';


@Component({
    selector: 'dashboard-signal',
    templateUrl: './dashboard.signal.html',
    styleUrls: ['./dashboard.signal.css'],
    providers: [SignalService, DecimalPipe]
})
export class SignalComponent implements OnInit {
    @Input() public selectedAccount: any;
    @Input() public autoInvestStatus: any;

    @ViewChildren(SignalSortableHeader)
    headers!: QueryList<SignalSortableHeader>;

    signals: Signal[] = [];

    constructor(
        public service: SignalService,
        private modalService: NgbModal,
        private broadcast: BroadcastService
    ) {
        // subscribe to broadcast event
        this.broadcast.subscribe("SIGNALS_UPDATED", (signals) => {
            this.signals = signals;
            this.search();
        });
    }

    ngOnInit(): void {
    }

    follow(signal: Signal): void {
        const modalRef = this.modalService.open(FollowSignalModal);
        modalRef.componentInstance.userId = this.selectedAccount.UserId;
        modalRef.componentInstance.signal = signal
    }

    cancel(signal: Signal): void {
        const modalRef = this.modalService.open(CancelSignalModal);
        modalRef.componentInstance.userId = this.selectedAccount.UserId;
        modalRef.componentInstance.signal = signal
    }

    search() {
        if (this.signals) {
            this.service.searchSignals(this.signals);
        }
    }

    onSort({ column, direction }: SignalSortEvent) {
        // resetting other headers
        this.headers.forEach(header => {
            if (header.sortablesignal !== column) {
                header.directionsignal = '';
            }
        });

        this.service.sortColumn = column;
        this.service.sortDirection = direction;
    }

}