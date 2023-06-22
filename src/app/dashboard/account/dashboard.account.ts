import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DecimalPipe } from '@angular/common';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { Client } from 'src/app/interface/client';
import { ModelPortfolio } from 'src/app/interface/model-portfolio';
import { AccountService } from './account.service';
import { ClientListSortableHeader, ClientListSortEvent } from './sortable.directive';
import { ClientModal } from './add-client/dashboard.client';
import { RemoveClientModal } from './remove-client/dashboard.remove-client';
import { DashboardService } from '../dashboard.service';
import { BroadcastService } from 'src/app/common/broadcast.service';


@Component({
  selector: 'dashboard-account',
  templateUrl: './dashboard.account.html',
  styleUrls: ['./dashboard.account.css'],
  providers: [AccountService, DecimalPipe]
})
export class AccountComponent implements OnInit {
  modelPortfolios$: Observable<ModelPortfolio[]>;
  modelPortfolios: ModelPortfolio[] = [];
  brokers: string[] = ["Interactive Brokers"];
  clients$: Observable<any> | undefined;
  clientList: Client[] = [];

  @ViewChildren(ClientListSortableHeader)
  headers!: QueryList<ClientListSortableHeader>;

  constructor(public accountService: AccountService,
    private modalService: NgbModal,
    private dashboardService: DashboardService,
    private db: AngularFireDatabase,
    private broadcast: BroadcastService
  ) {
    // get model portfilios & client list
    this.modelPortfolios$ = this.dashboardService.modelPortfolios$;
    this.modelPortfolios$.subscribe(result => {
      if (result && result.length > 0) {
        this.modelPortfolios = result;
        this.accountService.selectedModelPortfolio = result[0];
        this.accountService.searchClient(true);
      }
    });
    // subscribe to broadcast event
    this.broadcast.subscribe("RELOAD_CLIENT_LIST", () => {
      this.accountService.searchClient(true);
    });
    this.accountService.clients$.subscribe(result => {
      if (result) {
        this.clientList = result;
        this.subscribeFirebase();
      }
    });
  }

  ngOnInit(): void {
  }

  subscribeFirebase() {
    if (this.accountService.selectedModelPortfolio && this.accountService.selectedBroker) {
      this.clients$ = this.db.object('/clients/' + this.accountService.selectedModelPortfolio.ModelPortfolio + '/' + this.accountService.selectedBroker).valueChanges();
      this.clients$.subscribe(result => {
        console.log("Firebase clients data loaded!");
        if (result && Object.keys(result).length > 0 && this.clientList && this.clientList.length > 0) {
          for (var key1 in result) {
            if (result.hasOwnProperty(key1) && result[key1]) {
              var fbClient = result[key1];
              for (var client of this.clientList) {
                if (client.UserId === fbClient.UserId && fbClient.AccountNumber) {
                  client.AccountNumber = fbClient.AccountNumber;
                }
                if (client.UserId === fbClient.UserId && fbClient.AccountType) {
                  client.AccountType = fbClient.AccountType;
                }
                if (client.UserId === fbClient.UserId && fbClient.Status) {
                  client.Status = fbClient.Status;
                }
              }
            }
          }
        }
      });
    }
  }

  setStatus(status: string) {
    this.accountService.selectedStatus = status;
    this.accountService.searchClient(false);
  }

  setBroker(broker: string) {
    this.accountService.selectedBroker = broker;
    this.accountService.searchClient(true);
  }

  setModelPortfolio(modelPortfolio: ModelPortfolio) {
    this.accountService.selectedModelPortfolio = modelPortfolio;
    this.accountService.searchClient(true);
  }

  removeClient(client: Client) {
    const modalRef = this.modalService.open(RemoveClientModal);
    modalRef.componentInstance.client = client;
    modalRef.componentInstance.modelPortfolio = this.accountService.selectedModelPortfolio;
  }

  accessVM() {
    this.accountService.accessLargeVM();
  }

  accessIndividualVM(userId: string) {
    this.accountService.accessIndividualVM(userId);
  }

  addClient() {
    const modalRef = this.modalService.open(ClientModal);
    modalRef.componentInstance.modelPortfolios = this.modelPortfolios;
  }

  onSort({ column, direction }: ClientListSortEvent) {
    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.accountService.sortColumn = column;
    this.accountService.sortDirection = direction;
  }

}