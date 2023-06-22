import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfigService } from '../../common/config.service';
import { HandleError, HttpErrorHandler } from '../../common/http-error-handler.service';
import { Client } from '../../interface/client';
import { ModelPortfolio } from '../../interface/model-portfolio';


@Injectable({
    providedIn: 'root'
})
export class TradingService {
    private baseUrl = '';
    private serverApiKey = '';
    private accessToken = '';
    private handleError: HandleError;

    selectedModelPortfolio: ModelPortfolio = {
        ModelPortfolio: "",
        Broker: "",
        AccountType: "",
        Robot: ""
    };
    selectedBroker = "Interactive Brokers";
    selectedAccountNumber = "All";
    selectedAccount: Client = {
        Email: "",
        Name: "",
        PhoneNumber: "",
        AccountType: "",
        AccountNumber: "All",
        UserId: "",
        Status: ""
    };

    constructor(private http: HttpClient,
        private configService: ConfigService,
        httpErrorHandler: HttpErrorHandler) {
        this.handleError = httpErrorHandler.createHandleError('TradingService');
    }

    getAccountList() {
        return this.filterAccount(this.selectedModelPortfolio.ModelPortfolio, this.selectedBroker);
    }

    private filterAccount(modelPortfolio: string, broker: string) {
        return this.getManagedClients(modelPortfolio, broker).pipe(map(result => {
            let clients = result.filter(client => client.AccountNumber && client.AccountNumber !== "" && client.Status === "Ready");
            return clients;
        }));
    }

    /** POST: get managed client */
    private getManagedClients(modelPortfolio: string, broker: string): Observable<Client[]> {
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.AccessToken;
        }

        return this.http.post<Client[]>(this.baseUrl + "/autoinvestapi/v1/Client/GetManagedClients", {
            ModelPortfolio: modelPortfolio,
            Broker: broker
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<Client[]>('get managed client'))
            );
    }

    /** POST: manual follow signal */
    sendManualFollow(userId: string, roboName: string, strategyId: number, strategyName: string, posId: number,
        productId: number, signalDate: string): Observable<any> {
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.AccessToken;
        }

        return this.http.post<any>(this.baseUrl + "/autoinvestapi/v1/ClientOrder/SendManualFollow", {
            UserId: userId,
            Signal: {
                StrategyId: strategyId,
                SubRoboName: roboName,
                SubStrategyName: strategyName,
                PosId: posId,
                SignalDate: signalDate,
                Product: {
                    ProductId: productId
                }
            }
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<any>('manual follow signal'))
            );
    }

    /** POST: delete signal */
    sendDeleteSignal(userId: string, roboName: string, strategyId: number, strategyName: string, posId: number,
        productId: number, signalDate: string): Observable<any> {
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.AccessToken;
        }

        return this.http.post<any>(this.baseUrl + "/autoinvestapi/v1/ClientOrder/SendDeleteSignal", {
            UserId: userId,
            Signal: {
                StrategyId: strategyId,
                SubRoboName: roboName,
                SubStrategyName: strategyName,
                PosId: posId,
                SignalDate: signalDate,
                Product: {
                    ProductId: productId
                }
            }
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<any>('delete signal'))
            );
    }

    /** GET: get exchange rate */
    getExChangeRate(currencyPair: string): Observable<number> {
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.AccessToken;
        }

        return this.http.get<number>(this.baseUrl + "/autoinvestapi/v1/ExchangeRate/GetRate?currencyPair=" + currencyPair, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<number>('get exchange rate'))
            );
    }

    /** POST: get last market data */
    getLast(productId: number, symbol: string, tradeVenue: string, currency: string): Observable<any> {
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.AccessToken;
        }

        return this.http.post<any>(this.baseUrl + "/marketdataapi/v1/MarketData/GetLast", {
            ProductId: productId,
            Symbol: symbol,
            TradeVenueLoc: tradeVenue,
            Currency: currency
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<any>('get last'))
            );
    }

    /** POST: get bid market data */
    getBid(productId: number, symbol: string, tradeVenue: string, currency: string): Observable<any> {
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.AccessToken;
        }

        return this.http.post<any>(this.baseUrl + "/marketdataapi/v1/MarketData/GetBid", {
            ProductId: productId,
            Symbol: symbol,
            TradeVenueLoc: tradeVenue,
            Currency: currency
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<any>('get bid'))
            );
    }

    /** POST: get ask market data */
    getAsk(productId: number, symbol: string, tradeVenue: string, currency: string): Observable<any> {
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.AccessToken;
        }

        return this.http.post<any>(this.baseUrl + "/marketdataapi/v1/MarketData/GetAsk", {
            ProductId: productId,
            Symbol: symbol,
            TradeVenueLoc: tradeVenue,
            Currency: currency
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<any>('get ask'))
            );
    }

    /** POST: set autoinvest status */
    setAutoFlag(userId: string, isOn: boolean): Observable<{}> {
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.AccessToken;
        }

        return this.http.post<{}>(this.baseUrl + "/autoinvestapi/v1/Setting/SetAutoFlag", {
            UserId: userId,
            IsAuto: isOn
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<{}>('set autoinvest status'))
            );
    }

    /** POST: search product */
    searchProduct(keyword: string): Observable<[]> {
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.AccessToken;
        }

        return this.http.post<[]>(this.baseUrl + "/autoinvestapi/v1/Product/SearchSP500Products", {
            Keyword: keyword,
            Markets: ["US"],
            Take: 5
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<[]>('place order'))
            );
    }

    /** POST: place order */
    sendOrder(strategyId: number, productId: number, userId: string, action: string, orderType: string,
        orderPrice: string, quantity: string, validity: string): Observable<string> {
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.AccessToken;
        }

        return this.http.post<string>(this.baseUrl + "/autoinvestapi/v1/ClientOrder/SendOrder", {
            UserId: userId,
            StrategyId: strategyId,
            ProductId: productId,
            Action: action,
            OrderType: orderType,
            LimitPrice: orderType === "Limit" ? parseFloat(orderPrice) : 0,
            StopPrice: orderType === "Stop" ? parseFloat(orderPrice) : 0,
            Quantity: parseInt(quantity),
            Validity: validity
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<string>('place order'))
            );
    }

    /** POST: place order for all*/
    sendOrderForAll(strategyId: number, productId: number, userId: string, action: string, orderType: string,
        orderPrice: string, quantity: string, validity: string): Observable<string> {
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.AccessToken;
        }

        return this.http.post<string>(this.baseUrl + "/autoinvestapi/v1/ClientOrder/SendOrderForAll", {
            UserId: userId,
            StrategyId: strategyId,
            ProductId: productId,
            Action: action,
            OrderType: orderType,
            LimitPrice: orderType === "Limit" ? parseFloat(orderPrice) : 0,
            StopPrice: orderType === "Stop" ? parseFloat(orderPrice) : 0,
            Quantity: parseInt(quantity),
            Validity: validity
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<string>('place order'))
            );
    }

    /** POST: cancel order */
    cancelOrder(userId: string, orderId: number): Observable<{}> {
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.AccessToken;
        }

        return this.http.post<{}>(this.baseUrl + "/autoinvestapi/v1/ClientOrder/CancelOrder", {
            UserId: userId,
            OrderId: orderId.toString()
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<{}>('set autoinvest status'))
            );
    }

    /** POST: liquidate position */
    liquidatePosition(userId: string, strategyId: number, orderType: string): Observable<{}> {
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.AccessToken;
        }

        return this.http.post<{}>(this.baseUrl + "/autoinvestapi/v1/ClientOrder/LiquidatePosition", {
            UserId: userId,
            StrategyId: strategyId,
            OrderType: orderType
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<{}>('set autoinvest status'))
            );
    }

    /** POST: liquidate position for all */
    liquidatePositionForAll(broker: string, modelPortfolio: string, orderType: string): Observable<{}> {
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.AccessToken;
        }

        return this.http.post<{}>(this.baseUrl + "/autoinvestapi/v1/ClientOrder/LiquidatePositionForAll", {
            Broker: broker,
            ModelPortfolio: modelPortfolio,
            OrderType: orderType
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<{}>('set autoinvest status'))
            );
    }

    /** POST: get MM config */
    getMoneyManagementConfig(userId: string): Observable<any> {
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.AccessToken;
        }

        return this.http.post<any>(this.baseUrl + "/autoinvestapi/v1/Setting/GetMoneyManagementConfig", {
            UserId: userId
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<any>('set autoinvest status'))
            );
    }

    /** POST: set MM config */
    setMoneyManagementConfig(userId: string, template: string, maxAccountAlloc: number, maxLongAlloc: number, maxShortAlloc: number,
        autoInvestMode: string, longFixedAlloc: number, shortFixedAlloc: number, longMaxTradeAlloc: number, shortMaxTradeAlloc: number,
        leverage: number, stopLossEnabled: boolean, stopEntry: boolean, retryEnabled: boolean, stopLossPct: number, entrySlippageMode: string,
        exitSlippageMode: string, entrySlippagePct: number, exitSlippagePct: number, blacklistedProductIds: number[]): Observable<any> {
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.AccessToken;
        }

        return this.http.post<any>(this.baseUrl + "/autoinvestapi/v1/Setting/SetMoneyManagementConfig", {
            UserId: userId,
            Template: template === "default" ? 1 : 0,
            MaxAccountAlloc: maxAccountAlloc,
            MaxLongPortfolioAlloc: maxLongAlloc,
            MaxShortPortfolioAlloc: maxShortAlloc,
            AutoInvestMode: autoInvestMode,
            FixedAllocType: "Percentage",
            LongFixedTradeSize: 0,
            ShortFixedTradeSize: 0,
            LongFixedTradeAlloc: longFixedAlloc,
            ShortFixedTradeAlloc: shortFixedAlloc,
            LongMaxTradeAlloc: longMaxTradeAlloc,
            ShortMaxTradeAlloc: shortMaxTradeAlloc,
            Leverage: leverage,
            IsStopLossEnabled: stopLossEnabled,
            StopLossPct: stopLossPct,
            IsStopEntry: stopEntry,
            IsRetryEnabled: retryEnabled,
            EntrySlippageMode: parseInt(entrySlippageMode),
            EntrySlippageThresholdPct: entrySlippagePct,
            ExitSlippageMode: parseInt(exitSlippageMode),
            ExitSlippageThresholdPct: exitSlippagePct,
            BlacklistedProductIds: blacklistedProductIds
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<any>('set autoinvest status'))
            );
    }

    /** POST: set MM config for all */
    setMoneyManagementConfigForAll(broker: string, modelPortfolio: string, template: string, maxAccountAlloc: number, maxLongAlloc: number, maxShortAlloc: number,
        autoInvestMode: string, longFixedAlloc: number, shortFixedAlloc: number, longMaxTradeAlloc: number, shortMaxTradeAlloc: number,
        leverage: number, stopLossEnabled: boolean, stopEntry: boolean, retryEnabled: boolean, stopLossPct: number, entrySlippageMode: string,
        exitSlippageMode: string, entrySlippagePct: number, exitSlippagePct: number, blacklistedProductIds: number[]): Observable<any> {
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.AccessToken;
        }

        return this.http.post<any>(this.baseUrl + "/autoinvestapi/v1/Setting/SetMoneyManagementConfigForAll", {
            ModelPortfolio: modelPortfolio,
            Broker: broker,
            Template: template === "default" ? 1 : 0,
            MaxAccountAlloc: maxAccountAlloc,
            MaxLongPortfolioAlloc: maxLongAlloc,
            MaxShortPortfolioAlloc: maxShortAlloc,
            AutoInvestMode: autoInvestMode,
            FixedAllocType: "Percentage",
            LongFixedTradeSize: 0,
            ShortFixedTradeSize: 0,
            LongFixedTradeAlloc: longFixedAlloc,
            ShortFixedTradeAlloc: shortFixedAlloc,
            LongMaxTradeAlloc: longMaxTradeAlloc,
            ShortMaxTradeAlloc: shortMaxTradeAlloc,
            Leverage: leverage,
            IsStopLossEnabled: stopLossEnabled,
            StopLossPct: stopLossPct,
            IsStopEntry: stopEntry,
            IsRetryEnabled: retryEnabled,
            EntrySlippageMode: parseInt(entrySlippageMode),
            EntrySlippageThresholdPct: entrySlippagePct,
            ExitSlippageMode: parseInt(exitSlippageMode),
            ExitSlippageThresholdPct: exitSlippagePct,
            BlacklistedProductIds: blacklistedProductIds
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<any>('set autoinvest status'))
            );
    }

    /** POST: search product */
    getHistoricalPositions(userId: string, strategyId: number): Observable<[]> {
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.AccessToken;
        }

        return this.http.post<[]>(this.baseUrl + "/autoinvestapi/v1/AutoInvest/GetStrategyTradeProfit", {
            UserId: userId,
            StrategyId: strategyId
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<[]>('get historical positions'))
            );
    }
}
