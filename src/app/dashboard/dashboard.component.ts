import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { PlaceOrderModal } from './trading/place-order/dashboard.place-order';
import { DashboardService } from './dashboard.service';
import { SignalRService } from 'src/app/common/signalr.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  timerId: any;
  userName = "";

  constructor(
    private modalService: NgbModal,
    private dashboardService: DashboardService,
    private signalR: SignalRService,
    private router: Router,
    auth: AngularFireAuth
  ) {
    auth.authState.subscribe(user => {
      if (user) {
        console.log("logged in as:");
        console.log(user);
      }
    });
    this.signalR.startConnection();
  }

  ngOnInit(): void {
    // refresh token every 5 minutes
    this.timerId = setInterval(() => {
      this.refreshToken();
    }, 300000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }

    this.signalR.stopConnection();
  }

  ngAfterViewInit(): void {
    this.getUserInfo();
  }

  logout() {
    localStorage.removeItem('user-credential');
    localStorage.removeItem('firebase-uid');
    this.router.navigate(['']);
  }

  openProfile(){
    this.router.navigate(['profile']);
  }

  openDashboard(){
    this.router.navigate(['dashboard']);
  }

  placeOrder() {
    const modalRef = this.modalService.open(PlaceOrderModal);
    modalRef.componentInstance.symbol = 'AAPL';
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
    this.dashboardService.getNewToken().pipe(
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
    this.dashboardService.getUserInfo().subscribe(result => {
      if (result && result.UserName) {
        this.userName = result.UserName;
        localStorage.setItem('user-account', result.Email);
      }
      console.log(result);
      console.log("Get user info success");
    });
  }
}
