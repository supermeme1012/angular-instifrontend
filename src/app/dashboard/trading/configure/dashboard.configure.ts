import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Options } from '@angular-slider/ngx-slider';
import { FormControl } from '@angular/forms';
import { debounceTime } from "rxjs/operators";
import { TradingService } from '../trading.service';
import { Product } from 'src/app/interface/product';


@Component({
    selector: 'dashboard-configure',
    templateUrl: './dashboard.configure.html',
    styleUrls: ['./dashboard.configure.css']
})
export class ConfigureModal implements OnInit {
    @Input() public account: any;
    @Input() public modelPortfolio: any;
    @Input() public brokerAccount: any;
    @Input() public positions: any;

    loading = false;
    loadingProduct = false;
    selectedSizingMode = "Adaptive";
    selectedTemplate = "default";
    stopEntry = false;
    stopLossEnabled = false;
    leverageEnabled = true;
    stopLossPercent = 50;
    retryEnabled = true;
    entrySlippageMode = '1';
    exitSlippageMode = '1';
    entrySlippagePct = new FormControl(10);
    exitSlippagePct = new FormControl(10);
    productSearch = new FormControl('');
    productList: Product[] = [];
    blackListedProducts: Product[] = [];

    maxCapitalAlloc: number = 100;
    maxCapitalAllocOptions: Options = {
        floor: 0,
        ceil: 100
    };

    maxLongAlloc: number = 80;
    maxLongAllocOptions: Options = {
        floor: 0,
        ceil: 100
    };

    maxShortAlloc: number = 60;
    maxShortAllocOptions: Options = {
        floor: 0,
        ceil: 100
    };

    longAllocPerTrade: number = 5;
    longAllocPerTradeOptions: Options = {
        floor: 0.1,
        step: 0.1,
        ceil: 50
    };

    shortAllocPerTrade: number = 5;
    shortAllocPerTradeOptions: Options = {
        floor: 0.1,
        step: 0.1,
        ceil: 50
    };

    maxLongAllocPerTrade: number = 10;
    maxLongAllocPerTradeOptions: Options = {
        floor: 0.1,
        step: 0.1,
        ceil: 50
    };

    maxShortAllocPerTrade: number = 5;
    maxShortAllocPerTradeOptions: Options = {
        floor: 0.1,
        step: 0.1,
        ceil: 50
    };

    leverage: number = 2;
    leverageOptions: Options = {
        floor: 1,
        step: 0.1,
        ceil: 2
    };

    constructor(public modal: NgbActiveModal,
        private tradingService: TradingService
    ) {
        this.productSearch.valueChanges.pipe(debounceTime(500)).subscribe(res => {
            this.searchProduct();
        });
    }

    ngOnInit(): void {
        if (this.account && this.account.AccountNumber !== "All") {
            this.loading = true;
            this.tradingService.getMoneyManagementConfig(this.account.UserId).subscribe(result => {
                console.log(result);
                if (result) {
                    this.selectedTemplate = result.Template === 1 ? "default" : "custom";
                    this.selectedSizingMode = result.AutoInvestMode;
                    this.maxCapitalAlloc = result.MaxAccountAlloc;
                    this.maxLongAlloc = result.MaxLongPortfolioAlloc;
                    this.maxShortAlloc = result.MaxShortPortfolioAlloc;
                    this.longAllocPerTrade = result.LongFixedTradeAlloc;
                    this.shortAllocPerTrade = result.ShortFixedTradeAlloc;
                    this.maxLongAllocPerTrade = result.LongMaxTradeAlloc;
                    this.maxShortAllocPerTrade = result.ShortMaxTradeAlloc;
                    if (this.brokerAccount && this.brokerAccount.AccountType.toLowerCase() === "cash") {
                        this.leverageEnabled = false;
                        this.leverage = 1;
                    } else {
                        this.leverageEnabled = result.Leverage === 1 ? false : true;
                        this.leverage = result.Leverage;
                    }
                    this.stopLossEnabled = result.IsStopLossEnabled;
                    this.stopLossPercent = result.StopLossPct;
                    this.stopEntry = result.IsStopEntry;
                    this.retryEnabled = result.IsRetryEnabled;
                    this.entrySlippageMode = result.EntrySlippageMode.toString();
                    this.exitSlippageMode = result.ExitSlippageMode.toString();
                    this.entrySlippagePct = new FormControl(result.EntrySlippageThresholdPct);
                    this.exitSlippagePct = new FormControl(result.ExitSlippageThresholdPct);
                    if (result.BlacklistedProducts && result.BlacklistedProducts.length > 0) {
                        for (var product of result.BlacklistedProducts) {
                            this.blackListedProducts.push({
                                ProductId: product.ProductId,
                                Symbol: product.Symbol,
                                ProductName: product.ProductName,
                                Currency: product.Currency,
                                TradeVenueLoc: product.TradeVenueLoc,
                                LotSize: product.LotSize,
                                ProductIconURL: product.ProductIconURL,
                                Ask: 0,
                                Bid: 0,
                                BidVol: 0,
                                AskVol: 0,
                                Last: 0,
                                TodayOpen: 0,
                                LastClose: 0,
                                Change: 0,
                                ChangePct: 0,
                                Volume: 0
                            });
                        }
                    }
                }
                this.loading = false;
            });
        }
    }

    applyDeafultSettings() {
        if (this.selectedTemplate === "default") {
            this.maxCapitalAlloc = 100;
            this.maxLongAlloc = 80;
            this.maxShortAlloc = 60;
            this.maxLongAllocPerTrade = 10;
            this.maxShortAllocPerTrade = 5;
            this.leverage = 2;
            this.stopLossEnabled = false;
            this.selectedSizingMode = "Adaptive";
        }
    }

    private searchProduct() {
        this.loadingProduct = true;
        console.log("Search product " + this.productSearch.value + " ...");
        this.tradingService.searchProduct(this.productSearch.value).subscribe(result => {
            if (result && result.length > 0) {
                this.productList = result;
            }
            console.log("Search product success");
            this.loadingProduct = false;
        });
    }

    addBlacklistedProduct(product: Product) {
        if (product && product.ProductId > 0 &&
            this.blackListedProducts.filter(p => p.ProductId === product.ProductId).length == 0) {
            this.blackListedProducts.push(product);
        }
        this.productList = [];
    }

    removeBlacklistedProduct(product: Product) {
        this.blackListedProducts = this.blackListedProducts.filter(p => p.ProductId !== product.ProductId);
    }

    excludeOpenPositions() {
        if (this.positions && this.positions.length > 0) {
            for (var product of this.positions) {
                if (product && product.ProductId > 0 &&
                    this.blackListedProducts.filter(p => p.ProductId === product.ProductId).length == 0) {
                    this.blackListedProducts.push({
                        ProductId: product.ProductId,
                        Symbol: product.Symbol,
                        ProductName: product.ProductName,
                        Currency: product.Currency,
                        TradeVenueLoc: product.TradeVenueLoc,
                        LotSize: 1,
                        ProductIconURL: "",
                        Ask: 0,
                        Bid: 0,
                        BidVol: 0,
                        AskVol: 0,
                        Last: 0,
                        TodayOpen: 0,
                        LastClose: 0,
                        Change: 0,
                        ChangePct: 0,
                        Volume: 0
                    });
                }
            }
        }
    }

    save() {
        console.log("Selected template: " + this.selectedTemplate);
        console.log("Selected sizing mode: " + this.selectedSizingMode);
        console.log("Max capital allocation: " + this.maxCapitalAlloc);
        console.log("Max long allocation: " + this.maxLongAlloc);
        console.log("Max short allocation: " + this.maxShortAlloc);
        console.log("Long allocation per trade: " + this.longAllocPerTrade);
        console.log("Short allocation per trade: " + this.shortAllocPerTrade);
        console.log("Max long allocation per trade: " + this.maxLongAllocPerTrade);
        console.log("Max short allocation per trade: " + this.maxShortAllocPerTrade);
        console.log("Leverage: " + this.leverage);
        console.log("Stop Entry: " + this.stopEntry);
        console.log("Stop Loss Enabled: " + this.stopLossEnabled);
        console.log("Stop Loss Percent: " + this.stopLossPercent);
        console.log("Retry Enabled: " + this.retryEnabled);
        console.log("EntrySlippageMode: " + this.entrySlippageMode);
        console.log("ExitSlippageMode: " + this.exitSlippageMode);
        console.log("EntrySlippagePct: " + this.entrySlippagePct.value);
        console.log("ExitSlippagePct: " + this.exitSlippagePct.value);

        var productIds = this.blackListedProducts.map(p => p.ProductId);

        if (this.account.AccountNumber === "All") {
            this.tradingService.setMoneyManagementConfigForAll(this.modelPortfolio.Broker, this.modelPortfolio.ModelPortfolio, this.selectedTemplate,
                this.maxCapitalAlloc, this.maxLongAlloc, this.maxShortAlloc, this.selectedSizingMode, this.longAllocPerTrade, this.shortAllocPerTrade,
                this.maxLongAllocPerTrade, this.maxShortAllocPerTrade, this.leverage, this.stopLossEnabled, this.stopEntry, this.retryEnabled, this.stopLossPercent,
                this.entrySlippageMode, this.exitSlippageMode, parseFloat(this.entrySlippagePct.value), parseFloat(this.exitSlippagePct.value), productIds
            ).subscribe(result => {
                console.log("MM Settings success");
                this.modal.dismiss("MM Settings success");
                alert("Success, Settings saved!");
            });
        } else {
            this.tradingService.setMoneyManagementConfig(
                this.account.UserId, this.selectedTemplate,
                this.maxCapitalAlloc, this.maxLongAlloc, this.maxShortAlloc, this.selectedSizingMode, this.longAllocPerTrade, this.shortAllocPerTrade,
                this.maxLongAllocPerTrade, this.maxShortAllocPerTrade, this.leverage, this.stopLossEnabled, this.stopEntry, this.retryEnabled, this.stopLossPercent,
                this.entrySlippageMode, this.exitSlippageMode, parseFloat(this.entrySlippagePct.value), parseFloat(this.exitSlippagePct.value), productIds
            ).subscribe(result => {
                console.log("MM Settings success");
                this.modal.dismiss("MM Settings success");
                alert("Success, Settings saved!");
            });
        }
    }

    setSizingMode(mode: string) {
        this.selectedSizingMode = mode;
    }

    setStopLossPct(percent: number) {
        this.stopLossPercent = percent;
    }

    evaluateLeverage() {
        if (!this.leverageEnabled) {
            this.leverage = 1;
        }
    }
}