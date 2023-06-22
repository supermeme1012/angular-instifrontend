import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Client } from 'src/app/interface/client';
import { ConfigService } from '../../common/config.service';
import { DecimalPipe } from '@angular/common';
import { catchError, map } from 'rxjs/operators';
import { ClientListSortColumn, ClientListSortDirection } from './sortable.directive';
import { HandleError, HttpErrorHandler } from '../../common/http-error-handler.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ModelPortfolio } from 'src/app/interface/model-portfolio';
import { GuacCredential, GuacAuth } from 'src/app/interface/guac-credential'


interface SearchResult {
    clients: Client[];
    total: number;
}

interface State {
    page: number;
    pageSize: number;
    searchTerm: string;
    sortColumn: ClientListSortColumn;
    sortDirection: ClientListSortDirection;
}

const compare = (v1: string | number, v2: string | number) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(clients: Client[], column: ClientListSortColumn, direction: string): Client[] {
    if (direction === '' || column === '') {
        return clients;
    } else {
        return [...clients].sort((a, b) => {
            const res = compare(a[column], b[column]);
            return direction === 'asc' ? res : -res;
        });
    }
}

function matches(client: Client, term: string, pipe: PipeTransform) {
    return client.Name.toLowerCase().includes(term.toLowerCase())
        || client.Email.toLowerCase().includes(term.toLowerCase())
        || client.PhoneNumber.toLowerCase().includes(term.toLowerCase())
        || client.AccountNumber.toLowerCase().includes(term.toLowerCase())
        || client.AccountType.toLowerCase().includes(term.toLowerCase());
}

@Injectable({ providedIn: 'root' })
export class AccountService {
    private _loading$ = new BehaviorSubject<boolean>(true);
    private _clients$ = new BehaviorSubject<Client[]>([]);
    private _allClients$ = new BehaviorSubject<Client[]>([]);
    private _total$ = new BehaviorSubject<number>(0);
    private handleError: HandleError;
    private baseUrl = '';
    private guacUrl = '';
    private serverApiKey = '';
    private accessToken = '';
    private _state: State = {
        page: 1,
        pageSize: 5,
        searchTerm: '',
        sortColumn: '',
        sortDirection: ''
    };

    selectedModelPortfolio: ModelPortfolio = {
        ModelPortfolio: "",
        Broker: "",
        AccountType: "",
        Robot: ""
    };
    selectedBroker = "Interactive Brokers";
    selectedStatus = "All";

    constructor(private pipe: DecimalPipe, private http: HttpClient, private configService: ConfigService,
        httpErrorHandler: HttpErrorHandler) {
        this.handleError = httpErrorHandler.createHandleError('HomeService');
    }

    get clients$() { return this._clients$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }
    get page() { return this._state.page; }
    get pageSize() { return this._state.pageSize; }
    get searchTerm() { return this._state.searchTerm; }

    set page(page: number) { this._set({ page }); }
    set pageSize(pageSize: number) { this._set({ pageSize }); }
    set searchTerm(searchTerm: string) { this._set({ searchTerm }); }
    set sortColumn(sortColumn: ClientListSortColumn) { this._set({ sortColumn }); }
    set sortDirection(sortDirection: ClientListSortDirection) { this._set({ sortDirection }); }

    private _set(patch: Partial<State>) {
        Object.assign(this._state, patch);
        this.searchClient(false);
    }

    public searchClient(reload: boolean) {
        this._loading$.next(true)
        this._search(reload, this.selectedModelPortfolio.ModelPortfolio, this.selectedBroker, this.selectedStatus).subscribe(result => {
            this._clients$.next(result.clients);
            this._total$.next(result.total);
            this._loading$.next(false)
        });
    }

    private _search(reload: boolean, modelPortfolio: string, broker: string, status: string): Observable<SearchResult> {
        const { sortColumn, sortDirection, pageSize, page, searchTerm } = this._state;

        if (this._allClients$.getValue().length > 0 && !reload) {
            // 1. sort
            let clients = sort(this._allClients$.getValue(), sortColumn, sortDirection);
            // 2. filter
            clients = clients.filter(client => matches(client, searchTerm, this.pipe));
            clients = clients.filter(client => (client.Status && client.Status === status) || (status === "All"));
            const total = clients.length;
            // 3. paginate
            clients = clients.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

            return of({ clients, total });
        } else {
            return this.getManagedClients(modelPortfolio, broker).pipe(map(result => {
                // 1. sort
                let clients = sort(result, sortColumn, sortDirection);
                // 2. filter
                clients = clients.filter(client => matches(client, searchTerm, this.pipe));
                clients = clients.filter(client => (client.Status && client.Status === status) || (status === "All"));
                const total = clients.length;
                // 3. paginate
                clients = clients.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
                // 4. assign allClients
                this._allClients$.next(result);

                return { clients, total };
            }));
        }
    }

    accessLargeVM() {
        var newTab = window.open('', '_blank');
        newTab?.document.write("Connecting to VM...");
        this.getGuacamoleCredentials().subscribe(result => {
            if (result) {
                this.getGuacAuth(result.Username, result.Password).subscribe(guacAuth => {
                    if (guacAuth && guacAuth.username !== "" && newTab) {
                        localStorage.setItem('GUAC_AUTH', JSON.stringify(guacAuth));
                        document.cookie = "GUAC_AUTH=" + JSON.stringify(guacAuth);
                        newTab.location.href = '/guac/';
                    }
                });
            }
        });
    }

    accessIndividualVM(userId: string) {
        var newTab = window.open('', '_blank');
        newTab?.document.write("Connecting to VM...");
        this.getGuacamoleCredentialsByUserId(userId).subscribe(result => {
            if (result) {
                this.getGuacAuth(result.Username, result.Password).subscribe(guacAuth => {
                    if (guacAuth && guacAuth.username !== "" && newTab) {
                        localStorage.setItem('GUAC_AUTH', JSON.stringify(guacAuth));
                        document.cookie = "GUAC_AUTH=" + JSON.stringify(guacAuth);
                        newTab.location.href = '/guac/';
                    }
                });
            }
        });
    }

    private getGuacAuth(username: string, password: string): Observable<GuacAuth> {
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.guacUrl = config.guacUrl;
            this.serverApiKey = config.serverApiKey;
        }

        return this.http.post<GuacAuth>(this.guacUrl + "/api/tokens", "username=" + username + "&password=" + password, {
            headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded'
            })
        })
            .pipe(
                catchError(this.handleError<GuacAuth>('getGuacAuth'))
            );

    }

    /** GET: GetGuacamoleCredentialsByUserId */
    private getGuacamoleCredentials(): Observable<GuacCredential> {
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

        return this.http.get<GuacCredential>(this.baseUrl + "/autoinvestapi/v1/User/GetGuacamoleCredentials", {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<GuacCredential>('GetGuacamoleCredentialsByUserId'))
            );
    }

    /** GET: GetGuacamoleCredentialsByUserId */
    private getGuacamoleCredentialsByUserId(userId: string): Observable<GuacCredential> {
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

        return this.http.get<GuacCredential>(this.baseUrl + "/autoinvestapi/v1/User/GetGuacamoleCredentialsByUserId?userId=" + userId, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<GuacCredential>('GetGuacamoleCredentialsByUserId'))
            );
    }

    /** POST: CreateVmForUser */
    createVMForUser(userId: string): Observable<{}> {
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

        return this.http.post<{}>(this.baseUrl + "/autoinvestapi/v1/VmManager/CreateVmForUser", {
            UserId: userId
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<{}>('create VM for user'))
            );
    }

    /** POST: DeleteVm */
    deleteVm(userId: string): Observable<{}> {
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

        return this.http.post<{}>(this.baseUrl + "/autoinvestapi/v1/VmManager/DeleteVm", {
            UserId: userId
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<{}>('delete VM for user'))
            );
    }

    /** POST: add client */
    addClient(email: string, name: string, phone: string, modelPortfolio: string, broker: string): Observable<string> {
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

        return this.http.post<string>(this.baseUrl + "/autoinvestapi/v1/Client/AddClient", {
            Email: email,
            Name: name,
            Phone: phone,
            ModelPortfolio: modelPortfolio,
            Broker: broker
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<string>('add client'))
            );
    }

    /** POST: delete client */
    removeClient(userId: string, modelPortfolio: string, broker: string): Observable<{}> {
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

        return this.http.post<{}>(this.baseUrl + "/autoinvestapi/v1/Client/DeleteClient", {
            UserId: userId,
            ModelPortfolio: modelPortfolio,
            Broker: broker
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<{}>('delete client'))
            );
    }

    /** POST: get managed client */
    private getManagedClients(modelPortfolio: string, broker: string): Observable<Client[]> {
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

        return this.http.post<Client[]>(this.baseUrl + "/autoinvestapi/v1/Client/GetManagedClients", {
            ModelPortfolio: modelPortfolio,
            Broker: broker
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<Client[]>('get managed client'))
            );
    }
}
