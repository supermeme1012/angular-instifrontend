import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { TradingService } from '../trading.service';
import { HomeService } from 'src/app/home/home.service';


@Component({
    selector: 'dashboard-liquidate',
    templateUrl: './dashboard.liquidate.html',
    styleUrls: ['./dashboard.liquidate.css']
})
export class LiquidateModal implements OnInit {
    @Input() public account: any;
    @Input() public modelPortfolio: any;
    @Input() public positions: any;

    showPasswordBox = false;
    password = new FormControl('');

    constructor(public modal: NgbActiveModal, private tradingService: TradingService, private homeService: HomeService) { }

    ngOnInit(): void {
    }

    confirm() {
        this.showPasswordBox = true;
    }

    submit(orderType: string) {
        if (!this.password.value) {
            alert("Please put a valid password");
        } else {
            let userAccount = localStorage.getItem('user-account');
            if (userAccount) {
                // login with email & password
                this.homeService.login({
                    email: userAccount,
                    password: this.password.value
                }).pipe(
                    catchError(this.handleError)
                ).subscribe(result => {
                    if (result && result.Status === "Success") {
                        if (this.account.AccountNumber === 'All') {
                            this.tradingService.liquidatePositionForAll(this.account.Broker, this.modelPortfolio.ModelPortfolio, orderType).subscribe(result => {
                                console.log("Liquidate all success");
                                this.modal.dismiss("Liquidate all success");
                                alert("Success, request submitted!");
                            });
                        } else {
                            this.tradingService.liquidatePosition(this.account.UserId, this.modelPortfolio.StrategyId, orderType).subscribe(result => {
                                console.log("Liquidate all success");
                                this.modal.dismiss("Liquidate all success");
                                alert("Success, request submitted!");
                            });
                        }
                    }
                });
            }
        }
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === 500) {
            // A client-side or network error occurred. Handle it accordingly.
            alert('Failed, please check your password and try again');
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            alert('Failed, please check your password and try again');
        }
        // Return an observable with a user-facing error message.
        return throwError('Failed, please check your password and try again.');
    }
}