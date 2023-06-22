import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ActiveOrder } from 'src/app/interface/active-order';
import { DecimalPipe } from '@angular/common';
import { OrderSortColumn, OrderSortDirection } from './sortable.directive';

interface SearchResult {
    orders: ActiveOrder[];
    total: number;
}

interface State {
    page: number;
    pageSize: number;
    searchTerm: string;
    sortColumn: OrderSortColumn;
    sortDirection: OrderSortDirection;
}

const compare = (v1: string | number | boolean, v2: string | number | boolean) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(clients: ActiveOrder[], column: OrderSortColumn, direction: string): ActiveOrder[] {
    if (direction === '' || column === '') {
        return clients;
    } else {
        return [...clients].sort((a, b) => {
            const res = compare(a[column], b[column]);
            return direction === 'asc' ? res : -res;
        });
    }
}

function matches(order: ActiveOrder, term: string, pipe: PipeTransform) {
    return order.Symbol.toLowerCase().includes(term.toLowerCase())
        || order.Direction.toLowerCase().includes(term.toLowerCase())
        || order.Type.toLowerCase().includes(term.toLowerCase())
        || order.Validity.toLowerCase().includes(term.toLowerCase())
        || order.Status.toLowerCase().includes(term.toLowerCase())
        || pipe.transform(order.OrderPrice).includes(term);
}

@Injectable({ providedIn: 'root' })
export class OrderService {
    private _loading$ = new BehaviorSubject<boolean>(false);
    private _orders$ = new BehaviorSubject<ActiveOrder[]>([]);
    private _allOrders$ = new BehaviorSubject<ActiveOrder[]>([]);
    private _total$ = new BehaviorSubject<number>(0);

    private _state: State = {
        page: 1,
        pageSize: 10,
        searchTerm: '',
        sortColumn: '',
        sortDirection: ''
    };

    constructor(private pipe: DecimalPipe) { }

    get orders$() { return this._orders$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }
    get page() { return this._state.page; }
    get pageSize() { return this._state.pageSize; }
    get searchTerm() { return this._state.searchTerm; }

    set page(page: number) { this._set({ page }); }
    set pageSize(pageSize: number) { this._set({ pageSize }); }
    set searchTerm(searchTerm: string) { this._set({ searchTerm }); }
    set sortColumn(sortColumn: OrderSortColumn) { this._set({ sortColumn }); }
    set sortDirection(sortDirection: OrderSortDirection) { this._set({ sortDirection }); }

    searchOrders(orders: ActiveOrder[]) {
        this._loading$.next(true)
        this._search(orders).subscribe(result => {
            this._orders$.next(result.orders);
            this._total$.next(result.total);
            this._loading$.next(false)
        });
    }

    private _set(patch: Partial<State>) {
        Object.assign(this._state, patch);
        if (this._allOrders$.getValue().length > 0) {
            this.searchOrders(this._allOrders$.getValue());
        }
    }

    private _search(input: ActiveOrder[]): Observable<SearchResult> {
        const { sortColumn, sortDirection, pageSize, page, searchTerm } = this._state;

        // 1. sort
        let orders = sort(input, sortColumn, sortDirection);
        // 2. filter
        orders = orders.filter(order => matches(order, searchTerm, this.pipe));
        const total = orders.length;
        // 3. paginate
        orders = orders.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
        // 4. store all orders
        this._allOrders$.next(input);

        return of({ orders, total });
    }
}
