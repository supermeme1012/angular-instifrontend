import { Component, OnInit } from '@angular/core';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ProfileService } from './profile.service';


@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

    timerId: any;
    userName = "";
    twofaEnabled = false;
    isLoading = false;
    recoveryCodes: string[] = [];

    constructor(
        private profileService: ProfileService,
        private router: Router
    ) { }

    ngOnInit(): void {
        // refresh token every 5 minutes
        this.timerId = setInterval(() => {
            this.refreshToken();
        }, 300000);

        // check 2fa is set up or not
        this.isLoading = true;
        this.profileService.isTwoFactorEnabled().subscribe(result => {
            this.twofaEnabled = result;
            this.isLoading = false;
        });
    }

    ngOnDestroy(): void {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
    }

    ngAfterViewInit(): void {
        this.getUserInfo();
    }

    openDashboard() {
        this.router.navigate(['dashboard']);
    }

    generateRecoveryCodes() {
        this.profileService.generateRecoveryCodes().subscribe(result => {
            if (result && result.Status === "Success") {
                if (result.Data && result.Data.recoveryCodes) {
                    // display new recovery codes
                    this.recoveryCodes = result.Data.recoveryCodes;
                    alert("Success! Please copy and save your recovery code.");
                }
            } else {
                alert(result.Message);
            }
        });
    }

    resetAuthenticator() {
        this.profileService.resetAuthenticator().subscribe(result => {
            if (result && result.Status === "Success") {
                alert(result.Message);
                this.twofaEnabled = false;
            } else {
                alert(result.Message);
            }
        });
    }

    disable2fa() {
        this.profileService.disable2FA().subscribe(result => {
            if (result && result.Status === "Success") {
                alert(result.Message);
                this.router.navigate(['dashboard']);
            } else {
                alert(result.Message);
            }
        });
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === 401) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('Token expired, please login again');
            window.location.href = '/';
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            console.error(
                `Backend returned code ${error.status}, body was: `, error.error);
        }
        // Return an observable with a user-facing error message.
        return throwError(
            'Something bad happened; please try again later.');
    }

    refreshToken() {
        console.log("Refresh token...");
        this.profileService.getNewToken().pipe(
            catchError(this.handleError)
        ).subscribe(result => {
            console.log("Refresh token success");
            if (result && result.AccessToken) {
                const jsonData = JSON.stringify(result)
                localStorage.setItem('user-credential', jsonData);
            }
        });
    }

    getUserInfo() {
        console.log("Get user info...");
        this.profileService.getUserInfo().subscribe(result => {
            if (result && result.UserName) {
                this.userName = result.UserName;
                localStorage.setItem('user-account', result.Email);
            }
            console.log(result);
            console.log("Get user info success");
        });
    }
}
