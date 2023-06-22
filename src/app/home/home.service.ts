import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorHandler, HandleError } from '../common/http-error-handler.service';
import { ConfigService } from '../common/config.service';
import { Account } from '../interface/account';
import { LoginResult } from '../interface/api-token';
import { FirebaseToken } from '../interface/firebase-token';
import { VerifyAuthenticatorResult } from '../interface/2fa';


@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private baseUrl = '';
  private serverApiKey = '';
  private handleError: HandleError;

  constructor(
    private http: HttpClient,
    httpErrorHandler: HttpErrorHandler,
    private configService: ConfigService) {
    this.handleError = httpErrorHandler.createHandleError('HomeService');
  }

  /** POST: loginWithRecovery */
  loginWithRecovery(code: string, pass: string): Observable<VerifyAuthenticatorResult> {
    let config = this.configService.readConfig();
    if (config) {
      this.baseUrl = config.apiUrl;
      this.serverApiKey = config.serverApiKey;
    }

    return this.http.post<VerifyAuthenticatorResult>(this.baseUrl + "/autoinvestapi/v1/TwoFactorAuthentication/LoginWithRecovery", {
      RecoveryCode: code,
      Password: pass
    }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'ApiKey': this.serverApiKey
      })
    })
      .pipe(
        catchError(this.handleError<VerifyAuthenticatorResult>('loginWithRecovery'))
      );
  }

  /** POST: verify 2fa */
  verifyTwofa(code: string, pass: string): Observable<VerifyAuthenticatorResult> {
    let config = this.configService.readConfig();
    if (config) {
      this.baseUrl = config.apiUrl;
      this.serverApiKey = config.serverApiKey;
    }

    return this.http.post<VerifyAuthenticatorResult>(this.baseUrl + "/autoinvestapi/v1/TwoFactorAuthentication/Login", {
      TwoFactorCode: code,
      Password: pass,
      RememberMachine: false
    }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'ApiKey': this.serverApiKey
      })
    })
      .pipe(
        catchError(this.handleError<VerifyAuthenticatorResult>('verifyTwofa'))
      );
  }

  /** POST: reset password */
  resetPassword(email: string): Observable<{}> {
    let config = this.configService.readConfig();
    if (config) {
      this.baseUrl = config.apiUrl;
      this.serverApiKey = config.serverApiKey;
    }

    return this.http.post<{}>(this.baseUrl + "/autoinvestapi/v1/Connection/ResetPassword", {
      Email: email
    }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'ApiKey': this.serverApiKey
      })
    })
      .pipe(
        catchError(this.handleError<{}>('reset password'))
      );
  }

  /** POST: login account */
  login(account: Account): Observable<LoginResult> {
    let config = this.configService.readConfig();
    if (config) {
      this.baseUrl = config.apiUrl;
      this.serverApiKey = config.serverApiKey;
    }

    return this.http.post<LoginResult>(this.baseUrl + "/autoinvestapi/v1/Connection/ClientLogin", account, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'ApiKey': this.serverApiKey
      })
    })
  }

  /** POST: get custom firebase token from server */
  getFirebaseToken(accessToken: string): Observable<FirebaseToken> {
    let config = this.configService.readConfig();
    if (config) {
      this.baseUrl = config.apiUrl;
      this.serverApiKey = config.serverApiKey;
    }

    return this.http.post<FirebaseToken>(this.baseUrl + "/autoinvestapi/v1/Connection/CreateToken", {}, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'ApiKey': this.serverApiKey,
        'Authorization': 'Bearer ' + accessToken
      })
    })
      .pipe(
        catchError(this.handleError<FirebaseToken>('login account'))
      );
  }
}
