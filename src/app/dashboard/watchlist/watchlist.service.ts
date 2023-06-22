import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { ScreenerProduct } from 'src/app/interface/screener-product';
import { ConfigService } from '../../common/config.service';
import { DecimalPipe } from '@angular/common';
import { debounceTime, delay, switchMap, tap, catchError, map } from 'rxjs/operators';
import { WatchlistSortColumn, WatchlistSortDirection } from './sortable.directive';
import { HandleError, HttpErrorHandler } from '../../common/http-error-handler.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';


interface SearchResult {
    products: ScreenerProduct[];
    total: number;
}

interface State {
    page: number;
    pageSize: number;
    searchTerm: string;
    sortColumn: WatchlistSortColumn;
    sortDirection: WatchlistSortDirection;
}

const compare = (v1: string | number, v2: string | number) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(clients: ScreenerProduct[], column: WatchlistSortColumn, direction: string): ScreenerProduct[] {
    if (direction === '' || column === '') {
        return clients;
    } else {
        return [...clients].sort((a, b) => {
            const res = compare(a[column], b[column]);
            return direction === 'asc' ? res : -res;
        });
    }
}

function matches(product: ScreenerProduct, term: string, pipe: PipeTransform) {
    return product.Name.toLowerCase().includes(term.toLowerCase())
        || product.Symbol.toLowerCase().includes(term.toLowerCase());
}

@Injectable({ providedIn: 'root' })
export class WatchlistService {
    private _loading$ = new BehaviorSubject<boolean>(false);
    private _products$ = new BehaviorSubject<ScreenerProduct[]>([]);
    private _allProducts$ = new BehaviorSubject<ScreenerProduct[]>([]);
    private _total$ = new BehaviorSubject<number>(0);
    baseUrl = '';
    serverApiKey = '';
    accessToken = '';
    private handleError: HandleError;

    private _state: State = {
        page: 1,
        pageSize: 50,
        searchTerm: '',
        sortColumn: '',
        sortDirection: ''
    };

    constructor(private pipe: DecimalPipe, private http: HttpClient, private configService: ConfigService, httpErrorHandler: HttpErrorHandler) {
        this.handleError = httpErrorHandler.createHandleError('WatchlistService');
    }

    get products$() { return this._products$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }
    get page() { return this._state.page; }
    get pageSize() { return this._state.pageSize; }
    get searchTerm() { return this._state.searchTerm; }

    set page(page: number) { this._set({ page }); }
    set pageSize(pageSize: number) { this._set({ pageSize }); }
    set searchTerm(searchTerm: string) { this._set({ searchTerm }); }
    set sortColumn(sortColumn: WatchlistSortColumn) { this._set({ sortColumn }); }
    set sortDirection(sortDirection: WatchlistSortDirection) { this._set({ sortDirection }); }

    private _set(patch: Partial<State>) {
        Object.assign(this._state, patch);
        this.searchProduct(false);
    }

    searchProduct(showLoading: boolean){
        if(showLoading){
            this._loading$.next(true)
        }
        this._search().subscribe(result => {
            this._products$.next(result.products);
            this._total$.next(result.total);
            this._loading$.next(false)
        });
    }

    private _search(): Observable<SearchResult> {
        const { sortColumn, sortDirection, pageSize, page, searchTerm } = this._state;

        if (this._allProducts$.getValue().length > 0) {
            // 1. sort
            let products = sort(this._allProducts$.getValue(), sortColumn, sortDirection);
            // 2. filter
            products = products.filter(product => matches(product, searchTerm, this.pipe));
            const total = products.length;
            // 3. paginate
            products = products.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

            return of({ products, total });
        } else {
            return this.getScreenerProducts().pipe(map(result => {
                // 1. sort
                let products = sort(result, sortColumn, sortDirection);
                // 2. filter
                products = products.filter(product => matches(product, searchTerm, this.pipe));
                const total = products.length;
                // 3. paginate
                products = products.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
                // 4. assign _allProducts$
                this._allProducts$.next(result);

                return { products, total };
            }));
        }
    }

    /** GET: get screener products */
    getScreenerProducts(): Observable<ScreenerProduct[]> {
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

        return this.http.get<ScreenerProduct[]>(this.baseUrl + "/autoinvestapi/v1/MarketData/GetSP500ScreenerData", {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<ScreenerProduct[]>('get managed client'))
            );
    }
}
