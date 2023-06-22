import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigService } from '../common/config.service';
import { ApiToken } from '../interface/api-token';
import { HandleError, HttpErrorHandler } from '../common/http-error-handler.service';
import { User } from '../interface/user';
import { AuthenticatorDetail, VerifyAuthenticatorResult } from '../interface/2fa';


@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private baseUrl = '';
    private serverApiKey = '';
    private accessToken = '';
    private refreshToken = '';
    private handleError: HandleError;

    constructor(private http: HttpClient,
        private configService: ConfigService,
        httpErrorHandler: HttpErrorHandler) {
        this.handleError = httpErrorHandler.createHandleError('ProfileService');
    }

    /** POST: generateRecoveryCodes */
    generateRecoveryCodes(): Observable<VerifyAuthenticatorResult> {
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

        return this.http.post<VerifyAuthenticatorResult>(this.baseUrl + "/autoinvestapi/v1/TwoFactorAuthentication/GenerateRecoveryCodes", {}, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<VerifyAuthenticatorResult>('generateRecoveryCodes'))
            );
    }

    /** POST: resetAuthenticator */
    resetAuthenticator(): Observable<VerifyAuthenticatorResult> {
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

        return this.http.post<VerifyAuthenticatorResult>(this.baseUrl + "/autoinvestapi/v1/TwoFactorAuthentication/ResetAuthenticator", {}, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<VerifyAuthenticatorResult>('resetAuthenticator'))
            );
    }

    /** POST: Disable2FA */
    disable2FA(): Observable<VerifyAuthenticatorResult> {
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

        return this.http.post<VerifyAuthenticatorResult>(this.baseUrl + "/autoinvestapi/v1/TwoFactorAuthentication/Disable2FA", {}, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<VerifyAuthenticatorResult>('disable2FA'))
            );
    }

    /** POST: verifyAuthenticator */
    verifyAuthenticator(verificationCode: string): Observable<VerifyAuthenticatorResult> {
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

        return this.http.post<VerifyAuthenticatorResult>(this.baseUrl + "/autoinvestapi/v1/TwoFactorAuthentication/VerifyAuthenticator", {
            VerificationCode: verificationCode
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<VerifyAuthenticatorResult>('verifyAuthenticator'))
            );
    }

    /** GET: isTwoFactorEnabled */
    isTwoFactorEnabled(): Observable<boolean> {
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

        return this.http.get<boolean>(this.baseUrl + "/autoinvestapi/v1/TwoFactorAuthentication/IsTwoFactorEnabled", {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<boolean>('isTwoFactorEnabled'))
            );
    }

    /** GET: set up authenticator */
    setupAuthenticator(): Observable<AuthenticatorDetail> {
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

        return this.http.get<AuthenticatorDetail>(this.baseUrl + "/autoinvestapi/v1/TwoFactorAuthentication/SetupAuthenticator", {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<AuthenticatorDetail>('setupAuthenticator'))
            );
    }

    /** POST: refresh token */
    getNewToken(): Observable<ApiToken> {
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.AccessToken;
            this.refreshToken = userCredential.RefreshToken;
        }

        return this.http.post<ApiToken>(this.baseUrl + "/autoinvestapi/v1/Connection/RefreshToken", {
            RefreshToken: this.refreshToken
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        });
    }

    /** GET: get user info */
    getUserInfo(): Observable<User> {
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

        return this.http.get<User>(this.baseUrl + "/autoinvestapi/v1/User/GetUserInfo", {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<User>('login account'))
            );
    }
}
