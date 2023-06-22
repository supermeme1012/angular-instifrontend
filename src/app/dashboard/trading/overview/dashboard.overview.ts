import { Component, OnInit, Input } from '@angular/core';
import { BrokerAccount } from 'src/app/interface/broker-account';
import { BroadcastService } from 'src/app/common/broadcast.service';
import { Position } from 'src/app/interface/position';


@Component({
    selector: 'dashboard-overview',
    templateUrl: './dashboard.overview.html',
    styleUrls: ['./dashboard.overview.css']
})
export class OverviewComponent implements OnInit {
    @Input() public selectedAccount: any;
    @Input() public exchangeRate: any;

    brokerAccount: BrokerAccount = {
        AccountNumber: "",
        AccountType: "",
        BrokerType: "",
        Currency: "",
        Equity: 0,
        Fund: 0,
        Margin: 0,
        Available: 0,
        MaxLongAlloc: 100,
        MaxShortAlloc: 100
    };
    longExposure = 0;
    shortExposure = 0;
    longAllocationPct = 0;
    shortAllocationPct = 0;
    positions: Position[] = [];

    constructor(private broadcast: BroadcastService) {
        // subscribe to broadcast event
        this.broadcast.subscribe("BROKER_ACCOUNT_UPDATED", (brokerAccount) => {
            this.brokerAccount = brokerAccount;
        });
        this.broadcast.subscribe("POSITIONS_UPDATED", (positions) => {
            if (positions && positions.length > 0) {
                this.longExposure = 0;
                this.shortExposure = 0;
                this.longAllocationPct = 0;
                this.shortAllocationPct = 0;
                this.positions = positions;
                var longPositions = this.positions.filter(p => p.Position === "Long" && p.Allocation > 0);
                var shortPositions = this.positions.filter(p => p.Position === "Short" && p.Allocation > 0);
                

                if (longPositions && longPositions.length > 0) {
                    for (var product of longPositions) {
                        var exchangeRate = 1;
                        if(this.brokerAccount.Currency && product.Currency){
                            var currencyPair = product.Currency + "_" + this.brokerAccount.Currency;
                            if (this.exchangeRate && this.exchangeRate.hasOwnProperty(currencyPair)) {
                                exchangeRate = this.exchangeRate[currencyPair];
                            }
                        }
                        this.longAllocationPct += product.Allocation;
                        this.longExposure += product.Quantity * product.AvgEntryPrice * exchangeRate;
                    }
                }
                if (shortPositions && shortPositions.length > 0) {
                    for (var product of shortPositions) {
                        var exchangeRate = 1;
                        if(this.brokerAccount.Currency && product.Currency){
                            var currencyPair = product.Currency + "_" + this.brokerAccount.Currency;
                            if (this.exchangeRate && this.exchangeRate.hasOwnProperty(currencyPair)) {
                                exchangeRate = this.exchangeRate[currencyPair];
                            }
                        }
                        this.shortAllocationPct += product.Allocation;
                        this.shortExposure += product.Quantity * product.AvgEntryPrice * exchangeRate;
                    }
                }
            } else {
                this.positions = [];
                this.longExposure = 0;
                this.shortExposure = 0;
                this.longAllocationPct = 0;
                this.shortAllocationPct = 0;
            }
        });
    }

    ngOnInit(): void {

    }
}
