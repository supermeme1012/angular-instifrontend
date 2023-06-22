import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HomeService } from '../home.service';


@Component({
    selector: 'home-forget',
    templateUrl: './home.forget.html',
    styleUrls: ['./home.forget.css']
})
export class ForgetComponent implements OnInit {

    constructor(
        private homeService: HomeService
    ) { }

    ngOnInit(): void {
    }

    email = new FormControl('');

    submit() {
        if (!this.email.value) {
            return;
        }

        console.log("Reset password...");

        this.homeService.resetPassword(this.email.value).subscribe(result => {
            console.log("Reset password success");
            alert("Success! Please check your email.");
        })
    }
}