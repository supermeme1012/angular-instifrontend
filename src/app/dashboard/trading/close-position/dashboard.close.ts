import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl } from '@angular/forms';
import { TradingService } from '../trading.service';


@Component({
    selector: 'dashboard-close',
    templateUrl: './dashboard.close.html',
    styleUrls: ['./dashboard.close.css']
})
export class CloseModal implements OnInit {
    @Input() public account: any;
    @Input() public modelPortfolio: any;
    @Input() public productId: any;
    @Input() public symbol: any;
    @Input() public productName: any;
    @Input() public position: any;
    @Input() public quantity: any;
    @Input() public currency: any;

    showConfirm = false;
    selectedAction = 'Buy';
    orderType = 'Limit';
    orderValidity = 'Day';
    quantityForm = new FormControl('');
    orderPrice = new FormControl('');

    constructor(public modal: NgbActiveModal, private tradingService: TradingService) { }

    ngOnInit(): void {
        if (this.position) {
            this.selectedAction = this.position === "Long" ? "Sell" : "Buy";
        }
        if (this.quantity) {
            this.quantityForm = new FormControl(this.quantity);
        }
    }

    setAction(action: string) {
        this.selectedAction = action;
    }

    setOrderType(type: string) {
        this.orderType = type;
    }

    setOrderValidity(validity: string) {
        this.orderValidity = validity;
    }

    goToConfirm() {
        if (this.quantity.value === "") {
            alert("Please put a quantity");
        } else if (this.orderPrice.value === "" && this.orderType !== "Market") {
            alert("Please put a price");
        } else {
            this.showConfirm = true;
        }
    }

    goBack() {
        this.showConfirm = false;
    }

    confirmOrder() {
        console.log("Close position...");
        this.tradingService.sendOrder(
            this.modelPortfolio.StrategyId, this.productId, this.account.UserId,
            this.selectedAction, this.orderType, this.orderPrice.value, this.quantityForm.value,
            this.orderValidity
        ).subscribe(result => {
            console.log("Close position success");
            this.modal.dismiss("Close position success");
            alert("Success, Order submitted!");
        });
    }
}