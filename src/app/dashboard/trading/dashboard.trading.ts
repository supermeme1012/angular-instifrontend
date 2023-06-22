import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireDatabase } from '@angular/fire/database';
import { PlaceOrderModal } from './place-order/dashboard.place-order';
import { LiquidateModal } from './liquidate/dashboard.liquidate';
import { ConfigureModal } from './configure/dashboard.configure';
import { Observable, Subscription } from 'rxjs';
import { ModelPortfolio } from 'src/app/interface/model-portfolio';
import { Client } from 'src/app/interface/client';
import { Position } from 'src/app/interface/position';
import { ActiveOrder } from 'src/app/interface/active-order';
import { Signal } from 'src/app/interface/signal';
import { BrokerAccount } from 'src/app/interface/broker-account';
import { AlgoPosition } from 'src/app/interface/algo-position';
import { Historical } from 'src/app/interface/historical';
import { AutoStatusModal } from './auto-status/dashboard.auto-status';
import { DashboardService } from '../dashboard.service';
import { TradingService } from './trading.service';
import { BroadcastService } from 'src/app/common/broadcast.service';


@Component({
    selector: 'dashboard-trading',
    templateUrl: './dashboard.trading.html',
    styleUrls: ['./dashboard.trading.css']
})
export class TradingComponent implements OnInit {

    modelPortfolios$: Observable<ModelPortfolio[]>;
    accountList: Client[] = [];
    brokers: string[] = ["Interactive Brokers"];
    autoInvestStatus = 'on';
    users$: Observable<any> | undefined;
    algoPositions$: Observable<any> | undefined;
    opportunity$: Observable<any> | undefined;
    logs$: Observable<any> | undefined;
    usersSubscription: Subscription | undefined;
    algoPositionsSubscription: Subscription | undefined;
    opportunitySubscription: Subscription | undefined;
    logsSubscription: Subscription | undefined;
    activeOrders: ActiveOrder[] = [];
    signals: Signal[] = [];
    positions: Position[] = [];
    historicalLogs: Historical[] = [];
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
    loading = false;
    exchangeRate: { [id: string]: number } = {};

    constructor(
        public tradingService: TradingService,
        private modalService: NgbModal,
        private dashboardService: DashboardService,
        private db: AngularFireDatabase,
        private broadcast: BroadcastService
    ) {
        this.modelPortfolios$ = this.dashboardService.modelPortfolios$;
        this.modelPortfolios$.subscribe(result => {
            if (result && result.length > 0) {
                this.tradingService.selectedModelPortfolio = result[0];
                this.tradingService.getAccountList().subscribe(result => {
                    if (result && result.length == 1) {
                        this.setAccount(result[0], false);
                        this.accountList = result;
                    } else if (result && result.length > 1) {
                        this.setAccount({
                            Email: "",
                            Name: "",
                            PhoneNumber: "",
                            AccountType: "",
                            AccountNumber: "All",
                            UserId: "",
                            Status: ""
                        }, true);
                        this.accountList = result;
                    } else {
                        this.setAccount({
                            Email: "",
                            Name: "",
                            PhoneNumber: "",
                            AccountType: "",
                            AccountNumber: "All",
                            UserId: "",
                            Status: ""
                        }, true);
                        this.accountList = [];
                    }
                });
            }
        })
    }

    ngOnInit(): void {
    }

    ngOnDestory(): void {
        this.unsubscribeFirebase();
    }

    setAccount(account: Client, isAll: boolean) {
        if (isAll) {
            this.tradingService.selectedAccountNumber = "All";
            this.tradingService.selectedAccount = {
                Email: "",
                Name: "",
                PhoneNumber: "",
                AccountType: "",
                AccountNumber: "All",
                UserId: "",
                Status: ""
            };
            this.brokerAccount = {
                AccountNumber: "",
                BrokerType: "",
                AccountType: "",
                Currency: "",
                Equity: 0,
                Fund: 0,
                Margin: 0,
                Available: 0,
                MaxLongAlloc: 100,
                MaxShortAlloc: 100
            };
            this.unsubscribeFirebase();
        } else {
            this.tradingService.selectedAccountNumber = account.AccountNumber;
            this.tradingService.selectedAccount = account;
            var currencyPair = "USD_SGD";
            if (this.exchangeRate && !this.exchangeRate.hasOwnProperty(currencyPair)) {
                this.loading = true;
                this.tradingService.getExChangeRate(currencyPair).subscribe(result => {
                    console.log(result);
                    if (result && result > 0) {
                        this.exchangeRate[currencyPair] = result;
                    }
                    this.refreshFirebaseData();
                    this.loading = false;
                });
            } else {
                this.refreshFirebaseData();
            }
        }
        this.broadcast.boradcast("ACCOUNT_SELECTION_UPDATED", account);
    }

    setBroker(broker: string) {
        this.tradingService.selectedBroker = broker;
        this.unsubscribeFirebase();
        this.tradingService.getAccountList().subscribe(result => {
            if (result && result.length == 1) {
                this.setAccount(result[0], false);
                this.accountList = result;
            } else if (result && result.length > 1) {
                this.setAccount({
                    Email: "",
                    Name: "",
                    PhoneNumber: "",
                    AccountType: "",
                    AccountNumber: "All",
                    UserId: "",
                    Status: ""
                }, true);
                this.accountList = result;
            } else {
                this.setAccount({
                    Email: "",
                    Name: "",
                    PhoneNumber: "",
                    AccountType: "",
                    AccountNumber: "All",
                    UserId: "",
                    Status: ""
                }, true);
                this.accountList = [];
            }
        });
    }

    setModelPortfolio(modelPortfolio: ModelPortfolio) {
        if (this.tradingService.selectedModelPortfolio.ModelPortfolio != modelPortfolio.ModelPortfolio) {
            this.unsubscribeFirebase();
            this.tradingService.selectedModelPortfolio = modelPortfolio;
            this.tradingService.getAccountList().subscribe(result => {
                if (result && result.length == 1) {
                    this.setAccount(result[0], false);
                    this.accountList = result;
                } else if (result && result.length > 1) {
                    this.setAccount({
                        Email: "",
                        Name: "",
                        PhoneNumber: "",
                        AccountType: "",
                        AccountNumber: "All",
                        UserId: "",
                        Status: ""
                    }, true);
                    this.accountList = result;
                } else {
                    this.setAccount({
                        Email: "",
                        Name: "",
                        PhoneNumber: "",
                        AccountType: "",
                        AccountNumber: "All",
                        UserId: "",
                        Status: ""
                    }, true);
                    this.accountList = [];
                }
            });
        }
    }

    toggleAutoInvest(status: string) {
        if (this.autoInvestStatus !== status) {
            const modalRef = this.modalService.open(AutoStatusModal);
            modalRef.componentInstance.autoInvestStatus = status;
            modalRef.componentInstance.userId = this.tradingService.selectedAccount.UserId;
        }
    }

    configure() {
        const modalRef = this.modalService.open(ConfigureModal, { size: 'xl' });
        modalRef.componentInstance.account = this.tradingService.selectedAccount;
        modalRef.componentInstance.modelPortfolio = this.tradingService.selectedModelPortfolio;
        modalRef.componentInstance.brokerAccount = this.brokerAccount;
        modalRef.componentInstance.positions = this.positions;
    }

    placeOrder() {
        const modalRef = this.modalService.open(PlaceOrderModal, { size: 'xl' });
        modalRef.componentInstance.account = this.tradingService.selectedAccount;
        modalRef.componentInstance.modelPortfolio = this.tradingService.selectedModelPortfolio;
    }

    liquidate() {
        const modalRef = this.modalService.open(LiquidateModal);
        modalRef.componentInstance.account = this.tradingService.selectedAccount;
        modalRef.componentInstance.modelPortfolio = this.tradingService.selectedModelPortfolio;
        modalRef.componentInstance.positions = this.positions;
    }

    private getExchangeRate(currencyPair: string) {
        this.tradingService.getExChangeRate(currencyPair).subscribe(result => {
            if (result && result > 0) {
                this.exchangeRate[currencyPair] = result;
            }
        });
    }

    private unsubscribeFirebase() {
        if (this.usersSubscription) {
            this.usersSubscription.unsubscribe();
        }
        if (this.algoPositionsSubscription) {
            this.algoPositionsSubscription.unsubscribe();
        }
        if (this.opportunitySubscription) {
            this.opportunitySubscription.unsubscribe();
        }
        if (this.logsSubscription) {
            this.logsSubscription.unsubscribe();
        }
        console.log("Firebase subscriptions removed!");
    }

    refreshFirebaseData() {
        this.unsubscribeFirebase();

        if (this.tradingService.selectedAccount && this.tradingService.selectedAccount.UserId &&
            this.tradingService.selectedAccount.AccountNumber !== "All") {
            this.users$ = this.db.object('/users/' + this.tradingService.selectedAccount.UserId).valueChanges();
            this.algoPositions$ = this.db.object('/algoPositions/' + this.tradingService.selectedAccount.UserId).valueChanges();
            this.opportunity$ = this.db.object('/opportunity/' + this.tradingService.selectedAccount.UserId).valueChanges();
            this.logs$ = this.db.object('/logs/' + this.tradingService.selectedAccount.UserId).valueChanges();

            this.usersSubscription = this.users$.subscribe(result => {
                console.log("Firebase users data loaded!");
                // set broker account
                if (result && result.accounts && Object.keys(result.accounts).length > 0) {
                    this.brokerAccount = this.getBrokerAccount(result.accounts, result.linkings);
                    if (this.brokerAccount.Currency && !this.exchangeRate.hasOwnProperty("USD_" + this.brokerAccount.Currency)) {
                        this.getExchangeRate("USD_" + this.brokerAccount.Currency);
                    }
                } else {
                    this.brokerAccount = {
                        AccountNumber: "",
                        BrokerType: "",
                        AccountType: "",
                        Currency: "",
                        Equity: 0,
                        Fund: 0,
                        Margin: 0,
                        Available: 0,
                        MaxLongAlloc: 100,
                        MaxShortAlloc: 100
                    };
                }
                this.broadcast.boradcast("BROKER_ACCOUNT_UPDATED", this.brokerAccount);
                // load positions
                if (result && result.positions && Object.keys(result.positions).length > 0 && this.algoPositions$) {
                    this.loadPositions(result.positions, this.algoPositions$);
                } else {
                    this.positions = [];
                    this.broadcast.boradcast("POSITIONS_UPDATED", this.positions);
                }
                // set autoinvest status
                if (result && result.linkings && Object.keys(result.linkings).length > 0) {
                    this.autoInvestStatus = this.getAutoInvestStatus(result.linkings);
                } else {
                    this.autoInvestStatus = "off";
                }
                // set active orders
                if (result && result.orders && Object.keys(result.orders).length > 0) {
                    this.activeOrders = this.getActiveOrders(result.orders);
                } else {
                    this.activeOrders = [];
                }
                this.broadcast.boradcast("ACTIVE_ORDERS_UPDATED", this.activeOrders);
            });

            this.opportunitySubscription = this.opportunity$.subscribe(result => {
                console.log("Firebase opportunity data loaded!");
                // set signals
                if (result && Object.keys(result).length > 0) {
                    this.signals = this.getSignals(result);
                } else {
                    this.signals = [];
                }
                this.broadcast.boradcast("SIGNALS_UPDATED", this.signals);
            });

            this.logsSubscription = this.logs$.subscribe(result => {
                console.log("Firebase logs data loaded!");
                // set historical logs
                if (result && Object.keys(result).length > 0) {
                    this.historicalLogs = this.getLogs(result);
                } else {
                    this.historicalLogs = [];
                }
                this.broadcast.boradcast("HISTORICAL_LOGS_UPDATED", this.historicalLogs);
            });
        } else {
            this.autoInvestStatus = "off";
            this.brokerAccount = {
                AccountNumber: "",
                BrokerType: "",
                AccountType: "",
                Currency: "",
                Equity: 0,
                Fund: 0,
                Margin: 0,
                Available: 0,
                MaxLongAlloc: 100,
                MaxShortAlloc: 100
            };
            this.broadcast.boradcast("BROKER_ACCOUNT_UPDATED", this.brokerAccount);
            this.activeOrders = [];
            this.broadcast.boradcast("ACTIVE_ORDERS_UPDATED", this.activeOrders);
            this.signals = [];
            this.broadcast.boradcast("SIGNALS_UPDATED", this.signals);
            this.positions = [];
            this.broadcast.boradcast("POSITIONS_UPDATED", this.positions);
            this.historicalLogs = [];
            this.broadcast.boradcast("HISTORICAL_LOGS_UPDATED", this.historicalLogs);
        }
    }

    private getLogs(input: any) {
        let data: Historical[] = [];

        for (var key1 in input) {
            if (input.hasOwnProperty(key1) && input[key1]) {
                var log = input[key1];
                if (log.order && log.order.Product) {
                    data.push({
                        Symbol: log.order.Product.Symbol,
                        Direction: log.order.Action,
                        FillPrice: log.result.filledPrice,
                        Currency: log.order.Product.Currency,
                        Source: log.executionMode,
                        Intention: log.order.Intention,
                        Date: log.result.timeStamp
                    });
                }
            }
        }

        if (data.length > 0) {
            data = data.sort((a, b) => {
                return <any>new Date(b.Date) - <any>new Date(a.Date);
            });
        }

        return data;
    }

    private getAlgoPositions(input: any) {
        let data: AlgoPosition[] = [];

        for (var key1 in input) {
            if (input.hasOwnProperty(key1) && input[key1]) {
                var data1 = input[key1];
                for (var key2 in data1) {
                    if (data1.hasOwnProperty(key2) && data1[key2]) {
                        var data2 = data1[key2];
                        for (var key3 in data2) {
                            if (data2.hasOwnProperty(key3) && data2[key3]) {
                                var data3 = data2[key3];
                                for (var key4 in data3) {
                                    if (data3.hasOwnProperty(key4) && data3[key4]) {
                                        var data4 = data3[key4];
                                        for (var key5 in data4) {
                                            if (data4.hasOwnProperty(key5) && data4[key5]) {
                                                var algoPosition = data4[key5];
                                                data.push({
                                                    ProductId: <number>algoPosition.Product.ProductId,
                                                    Quantity: <number>algoPosition.Quantity,
                                                    Direction: <string>algoPosition.Direction,
                                                    AvgEntryPrice: <number>algoPosition.AvgEntryPrice,
                                                    EntryDate: <Date>algoPosition.EntryDateAux.replace(" ", "T"),
                                                    AllocAmt: <number>algoPosition.AllocAmt,
                                                    Currency: <string>algoPosition.Product.Currency
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return data;
    }

    private getBrokerAccount(input: any, linkings: any) {
        let account = {
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

        for (var key1 in input) {
            if (input.hasOwnProperty(key1) && input[key1] && key1 === this.tradingService.selectedAccount.AccountNumber) {
                var data = input[key1];
                account.BrokerType = <string>data.type;
                account.AccountNumber = <string>data.accountCode;
                account.AccountType = <string>data.accountType;
                account.Currency = <string>data.info.currency;
                account.Equity = <number>data.info.equity;
                account.Fund = <number>data.info.fund;
                account.Margin = <number>data.info.margin;
                account.Available = <number>data.info.available;
            }
        }

        for (var key1 in linkings) {
            if (linkings.hasOwnProperty(key1) && linkings[key1] && linkings[key1].accountCode === this.tradingService.selectedAccount.AccountNumber) {
                var data = linkings[key1];
                if (data.config) {
                    account.MaxLongAlloc = data.config.maxLongPortfolioAllocationPercent;
                    account.MaxShortAlloc = data.config.maxShortPortfolioAllocationPercent;
                }
            }
        }

        return account;
    }

    private getSignals(input: any) {
        let data: Signal[] = [];

        for (var key1 in input) {
            if (input.hasOwnProperty(key1) && input[key1]) {
                var data1 = input[key1];
                for (var key2 in data1) {
                    if (data1.hasOwnProperty(key2) && data1[key2]) {
                        var data2 = data1[key2];
                        for (var key3 in data2) {
                            if (data2.hasOwnProperty(key3) && data2[key3]) {
                                var data3 = data2[key3];
                                for (var key4 in data3) {
                                    if (data3.hasOwnProperty(key4) && data3[key4]) {
                                        var data4 = data3[key4];
                                        for (var key5 in data4) {
                                            if (data4.hasOwnProperty(key5) && data4[key5]) {
                                                var data5 = data4[key5];
                                                for (var key6 in data5) {
                                                    if (data5.hasOwnProperty(key6) && data5[key6]) {
                                                        var signal = data5[key6];
                                                        var status = this.getSignalStatus(signal.SignalStatus);
                                                        data.push({
                                                            ProductId: <number>signal.Product.ProductId,
                                                            StrategyId: <number>signal.StrategyId,
                                                            PosId: <number>signal.PosId,
                                                            SubRoboName: <string>signal.SubRoboName,
                                                            SubStrategyName: <string>signal.SubStrategyName,
                                                            SignalDate: <string>signal.SignalDate,
                                                            Symbol: <string>signal.Product.Symbol,
                                                            Currency: <string>signal.Product.Currency,
                                                            Action: <string>signal.Action,
                                                            Allocation: <number>signal.Allocation,
                                                            Intention: <string>signal.Intention,
                                                            Nature: <string>signal.SignalNature,
                                                            Mode: <string>signal.Mode,
                                                            Status: status
                                                        });
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return data;
    }

    private getSignalStatus(status: any) {
        switch (status) {
            case 1:
                return "Awaiting Activation";
            case 2:
                return "Awaiting Alpha";
            case 3:
                return "Evaluating Slippage";
            case 4:
                return "Waiting Slippage Random Period";
            case 5:
                return "Ready for Execution";
            case 6:
                return "Awaiting Status Report";
            case 7:
                return "Last Ditch Execution";
            case 8:
                return "Suspended For The Day";
            case 9:
                return "Manual Intervention";
            case 10:
                return "Executed";
            case 11:
                return "Manual Mode";
            default:
                return "";
        }
    }

    private getActiveOrders(input: any) {
        let data: ActiveOrder[] = [];

        for (var key1 in input) {
            if (input.hasOwnProperty(key1) && key1 === this.tradingService.selectedAccount.AccountNumber
                && input[key1] && input[key1].length > 0) {
                for (var key2 in input[key1]) {
                    if (input[key1].hasOwnProperty(key2) && input[key1][key2]) {
                        var order = input[key1][key2];
                        if (order.id) {
                            data.push({
                                OrderId: <number>order.id,
                                Symbol: <string>order.product,
                                Direction: <string>order.direction,
                                Quantity: <number>order.dealSize,
                                OrderPrice: order.type === "LIMIT" ? <number>order.limitPrice : (order.type === "STOP" ? <number>order.stopPrice : 0),
                                Currency: <string>order.currency,
                                Type: <string>order.type,
                                Validity: <string>order.validity,
                                Status: <string>order.orderStatus,
                            });
                        }
                    }
                }
            }
        }

        return data;
    }

    private getAutoInvestStatus(input: any) {
        let status = "off";

        for (var key in input) {
            if (input.hasOwnProperty(key) && input[key] && input[key].accountCode
                && input[key].accountCode === this.tradingService.selectedAccount.AccountNumber) {
                status = input[key].active ? "on" : "off";
            }
        }

        return status;
    }

    private loadPositions(input: any, algoPositions: Observable<any>) {
        this.algoPositionsSubscription = algoPositions.subscribe(result => {
            console.log("Firebase algoPositions data loaded!");
            let data: Position[] = [];
            let algoPositionData: AlgoPosition[] = [];
            // set positions
            if (result && Object.keys(result).length > 0) {
                algoPositionData = this.getAlgoPositions(result);
            }

            for (var key in input) {
                if (input.hasOwnProperty(key) && key === this.tradingService.selectedAccount.AccountNumber
                    && input[key] && input[key].length > 0) {
                    for (var posKey in input[key]) {
                        if (input[key].hasOwnProperty(posKey) && input[key][posKey]) {
                            var position = input[key][posKey];
                            if (position.algoProduct && position.algoProduct.Symbol) {
                                var allocation = 0;
                                var entryDate = new Date();
                                var hasAlgoPosition = false
                                var algoPosition = algoPositionData.filter(ap => ap.ProductId === <number>position.algoProduct.ProductId);
                                if (algoPosition && algoPosition.length > 0 && this.brokerAccount.Equity && this.brokerAccount.Equity > 0) {
                                    var exchangeRate = 1;
                                    if (this.brokerAccount.Currency && algoPosition[0].Currency) {
                                        var currencyPair = algoPosition[0].Currency + "_" + this.brokerAccount.Currency;
                                        if (this.exchangeRate && this.exchangeRate.hasOwnProperty(currencyPair)) {
                                            exchangeRate = this.exchangeRate[currencyPair];
                                        }
                                    }
                                    allocation = algoPosition[0].AllocAmt * exchangeRate / this.brokerAccount.Equity;
                                    entryDate = algoPosition[0].EntryDate;
                                    hasAlgoPosition = true;
                                }

                                data.push({
                                    ProductId: <number>position.algoProduct.ProductId,
                                    Symbol: <string>position.algoProduct.Symbol,
                                    ProductName: <string>position.algoProduct.ProductName,
                                    TradeVenueLoc: <string>position.algoProduct.TradeVenueLoc,
                                    Position: <string>position.direction == "BUY" ? "Long" : "Short",
                                    Quantity: <number>position.dealSize,
                                    Allocation: allocation,
                                    AvgEntryPrice: <number>position.openingPrice,
                                    Currency: <string>position.currency,
                                    UnrealizedPL: <number>position.unrealizedPNL,
                                    EntryDate: entryDate,
                                    HasAlgoPosition: hasAlgoPosition
                                });
                            }
                        }
                    }
                }
            }
            this.broadcast.boradcast("POSITIONS_UPDATED", data);
            this.positions = data;
        });
    }
}