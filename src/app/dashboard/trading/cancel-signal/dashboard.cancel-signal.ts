import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TradingService } from '../trading.service';


@Component({
    templateUrl: './dashboard.cancel-signal.html',
    styleUrls: ['./dashboard.cancel-signal.css']
})
export class CancelSignalModal implements OnInit {
    @Input() public signal: any;
    @Input() public userId: any;

    constructor(public modal: NgbActiveModal, private service: TradingService) { }

    ngOnInit(): void {
    }

    confirm() {
        console.log("Cancel signal...");
        this.service.sendDeleteSignal(this.userId, this.signal.SubRoboName, this.signal.StrategyId, this.signal.SubStrategyName,
            this.signal.PosId, this.signal.ProductId, this.signal.SignalDate).subscribe(result => {
                console.log("Cancel signal success");
                this.modal.dismiss("Cancel signal success");
                alert("Success, cancel request submitted");
            });
    }
}