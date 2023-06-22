import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { HistoricalPos } from 'src/app/interface/historical-pos';
import { DecimalPipe } from '@angular/common';
import { HistoricalPosSortColumn, HistoricalPosSortDirection } from './sortable.directive';

interface SearchResult {
    historicals: HistoricalPos[];
    total: number;
}

interface State {
    page: number;
    pageSize: number;
    searchTerm: string;
    sortColumn: HistoricalPosSortColumn;
    sortDirection: HistoricalPosSortDirection;
}

const compare = (v1: string | number | boolean | Date, v2: string | number | boolean | Date) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(clients: HistoricalPos[], column: HistoricalPosSortColumn, direction: string): HistoricalPos[] {
    if (direction === '' || column === '') {
        return clients;
    } else {
        if (column === 'Product') {
            return [...clients].sort((a, b) => {
                const res = compare(a[column].Symbol, b[column].Symbol);
                return direction === 'asc' ? res : -res;
            });    
        } else {
            return [...clients].sort((a, b) => {
                const res = compare(a[column], b[column]);
                return direction === 'asc' ? res : -res;
            });    
        }
    }
}

function matches(order: HistoricalPos, term: string, pipe: PipeTransform) {
    return order.Product.Symbol.toLowerCase().includes(term.toLowerCase())
        || order.Position.toLowerCase().includes(term.toLowerCase());
}

@Injectable({ providedIn: 'root' })
export class HistoricalPosService {
    private _loading$ = new BehaviorSubject<boolean>(false);
    private _historicals$ = new BehaviorSubject<HistoricalPos[]>([]);
    private _allHistoricals$ = new BehaviorSubject<HistoricalPos[]>([]);
    private _total$ = new BehaviorSubject<number>(0);

    private _state: State = {
        page: 1,
        pageSize: 10,
        searchTerm: '',
        sortColumn: '',
        sortDirection: ''
    };

    constructor(private pipe: DecimalPipe) { }

    get historicals$() { return this._historicals$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }
    get page() { return this._state.page; }
    get pageSize() { return this._state.pageSize; }
    get searchTerm() { return this._state.searchTerm; }

    set page(page: number) { this._set({ page }); }
    set pageSize(pageSize: number) { this._set({ pageSize }); }
    set searchTerm(searchTerm: string) { this._set({ searchTerm }); }
    set sortColumn(sortColumn: HistoricalPosSortColumn) { this._set({ sortColumn }); }
    set sortDirection(sortDirection: HistoricalPosSortDirection) { this._set({ sortDirection }); }

    searchHistoricals(historicals: HistoricalPos[]) {
        this._loading$.next(true)
        this._search(historicals).subscribe(result => {
            this._historicals$.next(result.historicals);
            this._total$.next(result.total);
            this._loading$.next(false)
        });
    }

    private _set(patch: Partial<State>) {
        Object.assign(this._state, patch);
        if (this._allHistoricals$.getValue().length > 0) {
            this.searchHistoricals(this._allHistoricals$.getValue());
        }
    }

    private _search(input: HistoricalPos[]): Observable<SearchResult> {
        const { sortColumn, sortDirection, pageSize, page, searchTerm } = this._state;

        // 1. sort
        let historicals = sort(input, sortColumn, sortDirection);
        // 2. filter
        historicals = historicals.filter(historical => matches(historical, searchTerm, this.pipe));
        const total = historicals.length;
        // 3. paginate
        historicals = historicals.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
        // 4. store all historicals
        this._allHistoricals$.next(input);

        return of({ historicals, total });
    }
}
