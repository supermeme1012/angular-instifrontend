import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TradingService } from '../trading.service';


@Component({
    templateUrl: './dashboard.follow-signal.html',
    styleUrls: ['./dashboard.follow-signal.css']
})
export class FollowSignalModal implements OnInit {
    @Input() public signal: any;
    @Input() public userId: any;

    constructor(public modal: NgbActiveModal, private service: TradingService) { }

    ngOnInit(): void {
    }

    confirm() {
        console.log("Follow signal...");
        this.service.sendManualFollow(this.userId, this.signal.SubRoboName, this.signal.StrategyId, this.signal.SubStrategyName,
            this.signal.PosId, this.signal.ProductId, this.signal.SignalDate).subscribe(result => {
                console.log("Follow signal success");
                this.modal.dismiss("Follow signal success");
                alert("Success, follow request submitted");
            });
    }
}