import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DecimalPipe } from '@angular/common';
import { FormControl } from '@angular/forms';
import { AccountService } from '../account.service';
import { ModelPortfolio } from 'src/app/interface/model-portfolio';
import { BroadcastService } from 'src/app/common/broadcast.service';


@Component({
    templateUrl: './dashboard.client.html',
    styleUrls: ['./dashboard.client.css'],
    providers: [AccountService, DecimalPipe]
})
export class ClientModal implements OnInit {
    @Input() public modelPortfolios: any;
    selectedModelPortfolio: ModelPortfolio = {
        ModelPortfolio: "",
        Broker: "",
        AccountType: "",
        Robot: ""
    };
    brokers: string[] = ["Interactive Brokers"];
    selectedBroker = "Interactive Brokers";
    email = new FormControl('');
    name = new FormControl('');
    phone = new FormControl('');

    constructor(public modal: NgbActiveModal, private service: AccountService, private broadcast: BroadcastService) { }

    ngOnInit(): void {
        this.selectedModelPortfolio = this.modelPortfolios[0]
    }

    confirm() {
        console.log("Add Client...");
        if (this.email.value && this.phone.value && this.name.value) {
            this.service.addClient(this.email.value,
                this.name.value,
                this.phone.value,
                this.selectedModelPortfolio.ModelPortfolio,
                this.selectedBroker
            ).subscribe(result => {
                if (result && result !== "") {
                    console.log("Client Added");
                    this.modal.dismiss("Client Added")
                    alert("Success");
                    this.broadcast.boradcast("RELOAD_CLIENT_LIST");
                    if (this.selectedModelPortfolio.AccountType === "Individual") {
                        console.log("Create VM...");
                        this.service.createVMForUser(result).subscribe(result => {
                            console.log("Create VM request sent");
                        });
                    }
                }
            });
        } else {
            alert("Wrong Input Value");
        }
    }
}