import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigService } from '../common/config.service';
import { ApiToken } from '../interface/api-token';
import { HandleError, HttpErrorHandler } from '../common/http-error-handler.service';
import { User } from '../interface/user';
import { ModelPortfolio } from '../interface/model-portfolio';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = '';
  private serverApiKey = '';
  private accessToken = '';
  private refreshToken = '';
  private handleError: HandleError;
  private _modelPortfolios$ = new BehaviorSubject<ModelPortfolio[]>([]);

  constructor(private http: HttpClient,
    private configService: ConfigService,
    httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('DashboardService');
    this.getModelPortfolios().subscribe(result => {
      this._modelPortfolios$.next(result);
    });
  }

  get modelPortfolios$() { return this._modelPortfolios$.asObservable(); }

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

  /** GET: get model portfolios */
  private getModelPortfolios(): Observable<ModelPortfolio[]> {
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

    return this.http.get<ModelPortfolio[]>(this.baseUrl + "/autoinvestapi/v1/Institution/GetModelPortfolios", {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'ApiKey': this.serverApiKey,
        'Authorization': 'Bearer ' + this.accessToken
      })
    })
      .pipe(
        catchError(this.handleError<ModelPortfolio[]>('get model portfolio'))
      );
  }
}
