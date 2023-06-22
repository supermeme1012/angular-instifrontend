import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TradingService } from '../trading.service';


@Component({
    templateUrl: './dashboard.auto-status.html',
    styleUrls: ['./dashboard.auto-status.css']
})
export class AutoStatusModal implements OnInit {
    @Input() public autoInvestStatus: any;
    @Input() public userId: any;

    constructor(public modal: NgbActiveModal, private service: TradingService) { }

    ngOnInit(): void {
    }

    confirm() {
        console.log("Set autoinvest status...");
        this.service.setAutoFlag(this.userId, this.autoInvestStatus === "on" ? true : false).subscribe(result => {
            console.log("Set autoinvest status to: " + this.autoInvestStatus);
            this.modal.dismiss("Set autoinvest status to: " + this.autoInvestStatus);
            alert("Success");
        });
    }
}