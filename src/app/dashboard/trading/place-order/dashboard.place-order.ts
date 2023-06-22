import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl } from '@angular/forms';
import { debounceTime } from "rxjs/operators";
import { Product } from 'src/app/interface/product';
import { TradingService } from '../trading.service';
import { SignalRService } from 'src/app/common/signalr.service';


@Component({
    selector: 'dashboard-place-order',
    templateUrl: './dashboard.place-order.html',
    styleUrls: ['./dashboard.place-order.css']
})
export class PlaceOrderModal implements OnInit {
    @Input() public account: any;
    @Input() public modelPortfolio: any;

    showConfirm = false;
    productSearch = new FormControl('');
    selectedAction = 'Buy';
    selectedProduct: Product = {
        ProductId: 0,
        Symbol: "",
        ProductName: "",
        Currency: "",
        TradeVenueLoc: "",
        LotSize: 0,
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
    };
    quantity = new FormControl('');
    orderType = 'Limit';
    orderPrice = new FormControl('');
    orderValidity = 'Day';
    productList: Product[] = [];
    loadingProduct = false;
    tradeAmount = 0;

    constructor(public modal: NgbActiveModal,
        private tradingService: TradingService,
        private signalR: SignalRService
    ) {
        this.productSearch.valueChanges.pipe(debounceTime(500)).subscribe(res => {
            this.searchProduct();
        });
        this.quantity.valueChanges.subscribe(res => {
            this.getTradeAmount();
        });
        this.orderPrice.valueChanges.subscribe(res => {
            this.getTradeAmount();
        });
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        if (this.selectedProduct.ProductId > 0) {
            this.signalR.unsubscribeMarketData([this.selectedProduct.ProductId], "US");
        }
    }

    private getTradeAmount() {
        if (this.quantity.value && this.orderPrice.value) {
            this.tradeAmount = parseInt(this.quantity.value) * parseFloat(this.orderPrice.value);
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

    selectProduct(product: Product) {
        if (this.selectedProduct.ProductId !== product.ProductId) {
            if (this.selectedProduct.ProductId > 0) {
                this.signalR.unsubscribeMarketData([this.selectedProduct.ProductId], "US");
            }
            this.productSearch = new FormControl(product.Symbol);
            this.selectedProduct = product;
            this.productList = [];
            this.productSearch.valueChanges.pipe(debounceTime(500)).subscribe(res => {
                this.searchProduct();
            });
            this.signalR.subscribeToMarketData([product.ProductId], "US", this.onMarketDataUpdate.bind(this));
            this.loadMarketData(product);
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
        if (this.selectedProduct.ProductId === 0) {
            alert("Please select a product");
        } else if (this.quantity.value === "") {
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
        console.log("Place order...");
        if (this.account.AccountNumber === "All") {
            this.tradingService.sendOrderForAll(
                this.modelPortfolio.StrategyId, this.selectedProduct.ProductId, this.account.UserId,
                this.selectedAction, this.orderType, this.orderPrice.value, this.quantity.value,
                this.orderValidity
            ).subscribe(result => {
                console.log("Place order success");
                this.modal.dismiss("Place order success");
                alert("Success, Order submitted!");
            });
        } else {
            this.tradingService.sendOrder(
                this.modelPortfolio.StrategyId, this.selectedProduct.ProductId, this.account.UserId,
                this.selectedAction, this.orderType, this.orderPrice.value, this.quantity.value,
                this.orderValidity
            ).subscribe(result => {
                console.log("Place order success");
                this.modal.dismiss("Place order success");
                alert("Success, Order submitted!");
            });
        }
    }

    private onMarketDataUpdate(data: any) {
        if (data.Symbol === this.selectedProduct.Symbol && data.LastTradedPrice) {
            this.selectedProduct.Last = data.LastTradedPrice;
        }
        if (data.Symbol === this.selectedProduct.Symbol && data.BidPrice) {
            this.selectedProduct.Bid = data.BidPrice;
            this.selectedProduct.BidVol = data.BidSize;
        }
        if (data.Symbol === this.selectedProduct.Symbol && data.AskPrice) {
            this.selectedProduct.Ask = data.AskPrice;
            this.selectedProduct.AskVol = data.AskSize;
        }
    }

    private loadMarketData(product: Product) {
        this.tradingService.getLast(product.ProductId, product.Symbol, product.TradeVenueLoc, product.Currency).subscribe(result => {
            if (result && result.LastTradedPrice) {
                this.selectedProduct.Last = result.LastTradedPrice;
            }
        });
        this.tradingService.getBid(product.ProductId, product.Symbol, product.TradeVenueLoc, product.Currency).subscribe(result => {
            if (result && result.BidPrice) {
                this.selectedProduct.Bid = result.BidPrice;
                this.selectedProduct.BidVol = result.BidSize;
            }
        });
        this.tradingService.getAsk(product.ProductId, product.Symbol, product.TradeVenueLoc, product.Currency).subscribe(result => {
            if (result && result.AskPrice) {
                this.selectedProduct.Ask = result.AskPrice;
                this.selectedProduct.AskVol = result.AskSize;
            }
        });
    }
}