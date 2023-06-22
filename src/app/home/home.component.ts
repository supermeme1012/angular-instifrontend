import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

import { HomeService } from './home.service';
import { Account } from '../interface/account';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private homeService: HomeService,
    private router: Router,
    private auth: AngularFireAuth
  ) { }

  ngOnInit(): void {
  }

  email = new FormControl('');
  password = new FormControl('');
  twofa = new FormControl('');
  recoveryCode = new FormControl('');
  showTwofa = false;
  showRecovery = false;

  goToRecovery() {
    this.showRecovery = true;
  }

  loginWithRecovery() {
    if (!this.recoveryCode.value) {
      alert('Please put a valid code');
      return;
    }

    this.homeService.loginWithRecovery(this.recoveryCode.value.toString(), this.password.value.toString()).subscribe(result => {
      if (result.Status === "Success") {
        const jsonData = JSON.stringify(result.Data)
        localStorage.setItem('user-credential', jsonData);
        localStorage.setItem('user-account', this.email.value);
        // get firebase custom token from server
        this.homeService.getFirebaseToken(result.Data.AccessToken).subscribe(result => {
          if (result.Token) {
            // sign in firebase
            this.auth.signInWithCustomToken(result.Token).then((userCredential) => {
              if (userCredential && userCredential.user) {
                const uid = userCredential.user.uid;
                localStorage.setItem('firebase-uid', uid);

                console.log("Log in success");
                this.router.navigate(['dashboard']);
              }
            });
          }
        });
      } else if (result.Status === "Error") {
        alert(result.Message);
      }
    });
  }

  verifyTwofa() {
    if (!this.twofa.value) {
      alert('Please put a 6-digit code');
      return;
    }

    this.homeService.verifyTwofa(this.twofa.value.toString(), this.password.value.toString()).subscribe(result => {
      if (result.Status === "Success") {
        const jsonData = JSON.stringify(result.Data)
        localStorage.setItem('user-credential', jsonData);
        localStorage.setItem('user-account', this.email.value);
        // get firebase custom token from server
        this.homeService.getFirebaseToken(result.Data.AccessToken).subscribe(result => {
          if (result.Token) {
            // sign in firebase
            this.auth.signInWithCustomToken(result.Token).then((userCredential) => {
              if (userCredential && userCredential.user) {
                const uid = userCredential.user.uid;
                localStorage.setItem('firebase-uid', uid);

                console.log("Log in success");
                this.router.navigate(['dashboard']);
              }
            });
          }
        });
      } else if (result.Status === "Error") {
        alert(result.Message);
      }
    });
  }

  submit() {
    if (!this.email.value || !this.password.value) {
      alert('Please put a valid email or password');
      return;
    }

    console.log("Log in...");

    let account: Account = {
      email: this.email.value,
      password: this.password.value
    }

    // login with email & password
    this.homeService.login(account).pipe(
      catchError(this.handleError)
    ).subscribe(result => {
      if (result && result.Status === "Success" && result.Data && result.Data.AccessToken) {
        const jsonData = JSON.stringify(result.Data)
        localStorage.setItem('user-credential', jsonData);
        localStorage.setItem('user-account', this.email.value);
        // get firebase custom token from server
        this.homeService.getFirebaseToken(result.Data.AccessToken).subscribe(result => {
          if (result.Token) {
            // sign in firebase
            this.auth.signInWithCustomToken(result.Token).then((userCredential) => {
              if (userCredential && userCredential.user) {
                const uid = userCredential.user.uid;
                localStorage.setItem('firebase-uid', uid);

                console.log("Log in success");
                this.router.navigate(['dashboard']);
              }
            });
          }
        });
      } else if (result && result.Status === "Success" && result.Data && result.Data.requires2FA) {
        this.showTwofa = true;
      }
    });
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 500) {
      // A client-side or network error occurred. Handle it accordingly.
      alert('Login failed, please check your account or password and try again');
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      alert('Login failed, please check your account or password and try again');
    }
    // Return an observable with a user-facing error message.
    return throwError('Login failed, please check your account or password and try again.');
  }
}
