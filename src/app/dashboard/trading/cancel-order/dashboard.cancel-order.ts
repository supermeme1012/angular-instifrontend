import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TradingService } from '../trading.service';


@Component({
    templateUrl: './dashboard.cancel-order.html',
    styleUrls: ['./dashboard.cancel-order.css']
})
export class CancelOrderModal implements OnInit {
    @Input() public userId: any;
    @Input() public orderId: any;

    constructor(public modal: NgbActiveModal, private service: TradingService) { }

    ngOnInit(): void {
    }

    confirm() {
        console.log("Cancel order...");
        this.service.cancelOrder(this.userId, this.orderId).subscribe(result => {
            console.log("Cancel order success");
            this.modal.dismiss("Cancel order success");
            alert("Success, cancel request submitted");
        });
    }
}