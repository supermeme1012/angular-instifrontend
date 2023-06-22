import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { Historical } from 'src/app/interface/historical';
import { DecimalPipe } from '@angular/common';
import { HistoricalSortColumn, HistoricalSortDirection } from './sortable.directive';

interface SearchResult {
    historicals: Historical[];
    total: number;
}

interface State {
    page: number;
    pageSize: number;
    searchTerm: string;
    sortColumn: HistoricalSortColumn;
    sortDirection: HistoricalSortDirection;
}

const compare = (v1: string | number | boolean | Date, v2: string | number | boolean | Date) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(clients: Historical[], column: HistoricalSortColumn, direction: string): Historical[] {
    if (direction === '' || column === '') {
        return clients;
    } else {
        return [...clients].sort((a, b) => {
            const res = compare(a[column], b[column]);
            return direction === 'asc' ? res : -res;
        });
    }
}

function matches(order: Historical, term: string, pipe: PipeTransform) {
    return order.Symbol.toLowerCase().includes(term.toLowerCase())
        || order.Direction.toLowerCase().includes(term.toLowerCase())
        || order.Source.toLowerCase().includes(term.toLowerCase())
        || order.Intention.toLowerCase().includes(term.toLowerCase())
        || pipe.transform(order.FillPrice).includes(term);
}

@Injectable({ providedIn: 'root' })
export class HistoricalService {
    private _loading$ = new BehaviorSubject<boolean>(false);
    private _historicals$ = new BehaviorSubject<Historical[]>([]);
    private _allHistoricals$ = new BehaviorSubject<Historical[]>([]);
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
    set sortColumn(sortColumn: HistoricalSortColumn) { this._set({ sortColumn }); }
    set sortDirection(sortDirection: HistoricalSortDirection) { this._set({ sortDirection }); }

    searchHistoricals(historicals: Historical[]) {
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

    private _search(input: Historical[]): Observable<SearchResult> {
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
