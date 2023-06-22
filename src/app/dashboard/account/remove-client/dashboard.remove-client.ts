import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DecimalPipe } from '@angular/common';
import { AccountService } from '../account.service';
import { BroadcastService } from 'src/app/common/broadcast.service';


@Component({
    templateUrl: './dashboard.remove-client.html',
    styleUrls: ['./dashboard.remove-client.css'],
    providers: [AccountService, DecimalPipe]
})
export class RemoveClientModal implements OnInit {
    @Input() public client: any;
    @Input() public modelPortfolio: any;

    constructor(public modal: NgbActiveModal, private service: AccountService, private broadcast: BroadcastService) { }

    ngOnInit(): void {
    }

    confirm() {
        console.log("Remove Client...");
        this.service.removeClient(this.client.UserId, this.client.ModelPortfolio, this.client.Broker).subscribe(result => {
            console.log("Client Removed");
            this.modal.dismiss("Client Removed")
            alert("Success");
            this.broadcast.boradcast("RELOAD_CLIENT_LIST");
            if (this.modelPortfolio.AccountType === 'Individual') {
                this.service.deleteVm(this.client.UserId).subscribe(result => {
                    console.log("Delete VM request sent");
                });;
            }
        });
    }
}