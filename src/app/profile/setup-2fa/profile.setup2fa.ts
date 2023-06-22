import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '../profile.service';
import { AuthenticatorDetail } from 'src/app/interface/2fa';


@Component({
    selector: 'app-profile-setup2fa',
    templateUrl: './profile.setup2fa.html',
    styleUrls: ['./profile.setup2fa.css']
})
export class Setup2faComponent implements OnInit {

    authenticatorDetails: AuthenticatorDetail = <AuthenticatorDetail>{};
    displayAuthenticator: boolean = false;
    verificationCode: string = '';
    errors: string = '';
    recoveryCodes: string[] = [];
    authenticatorNeedsSetup: boolean = false;
    validVerificationCodes: number[] = [];
    pollForValidVerificationCodes: any = null;
    displayValidVerificationCodes: boolean = false;
    generatedQRCode: any;

    constructor(
        private profileService: ProfileService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.setupAuthenticator();
    }

    openDashboard() {
        this.router.navigate(['dashboard']);
    }

    onKeydown(event: any) {
        if (event.key === "Enter") {
            //this.verifyAuthenticator();
        }
    }

    setupAuthenticator() {
        this.recoveryCodes = [];
        this.displayAuthenticator = false;

        this.profileService.setupAuthenticator().subscribe(result => {
            this.displayAuthenticator = true;
            this.authenticatorDetails = result;
        }, error => console.error(error));
    }

    verifyAuthenticator() {
        this.errors = '';
        this.profileService.verifyAuthenticator(this.verificationCode.toString()).subscribe(result => {
            if (result.Status === "Success") {
                if (result.Data && result.Data.recoveryCodes) {
                    // display new recovery codes
                    this.recoveryCodes = result.Data.recoveryCodes;
                    this.displayAuthenticator = false;
                    alert("Success! Please copy and save your recovery codes.");
                } else {
                    alert("Success!");
                    this.router.navigate(['']);
                }
            } else if (result.Status === "Error") {
                this.errors = result.Data.toString();
            }

        }, error => console.error(error));
    }
}
