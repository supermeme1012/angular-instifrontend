import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Signal } from 'src/app/interface/signal';
import { DecimalPipe } from '@angular/common';
import { SignalSortColumn, SignalSortDirection } from './sortable.directive';

interface SearchResult {
    signals: Signal[];
    total: number;
}

interface State {
    page: number;
    pageSize: number;
    searchTerm: string;
    sortColumn: SignalSortColumn;
    sortDirection: SignalSortDirection;
}

const compare = (v1: string | number | boolean, v2: string | number | boolean) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(clients: Signal[], column: SignalSortColumn, direction: string): Signal[] {
    if (direction === '' || column === '') {
        return clients;
    } else {
        return [...clients].sort((a, b) => {
            const res = compare(a[column], b[column]);
            return direction === 'asc' ? res : -res;
        });
    }
}

function matches(signal: Signal, term: string, pipe: PipeTransform) {
    return signal.Symbol.toLowerCase().includes(term.toLowerCase())
        || signal.Action.toLowerCase().includes(term.toLowerCase())
        || signal.Intention.toLowerCase().includes(term.toLowerCase())
        || signal.Nature.toLowerCase().includes(term.toLowerCase())
        || signal.Mode.toLowerCase().includes(term.toLowerCase())
        || signal.Status.toLowerCase().includes(term.toLowerCase())
        || pipe.transform(signal.Allocation).includes(term);
}

@Injectable({ providedIn: 'root' })
export class SignalService {
    private _loading$ = new BehaviorSubject<boolean>(true);
    private _signals$ = new BehaviorSubject<Signal[]>([]);
    private _allSignals$ = new BehaviorSubject<Signal[]>([]);
    private _total$ = new BehaviorSubject<number>(0);

    private _state: State = {
        page: 1,
        pageSize: 10,
        searchTerm: '',
        sortColumn: '',
        sortDirection: ''
    };

    constructor(private pipe: DecimalPipe) { }

    get signals$() { return this._signals$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }
    get page() { return this._state.page; }
    get pageSize() { return this._state.pageSize; }
    get searchTerm() { return this._state.searchTerm; }

    set page(page: number) { this._set({ page }); }
    set pageSize(pageSize: number) { this._set({ pageSize }); }
    set searchTerm(searchTerm: string) { this._set({ searchTerm }); }
    set sortColumn(sortColumn: SignalSortColumn) { this._set({ sortColumn }); }
    set sortDirection(sortDirection: SignalSortDirection) { this._set({ sortDirection }); }

    searchSignals(signals: Signal[]) {
        this._loading$.next(true)
        this._search(signals).subscribe(result => {
            this._signals$.next(result.signals);
            this._total$.next(result.total);
            this._loading$.next(false)
        });
    }

    private _set(patch: Partial<State>) {
        Object.assign(this._state, patch);
        if (this._allSignals$.getValue().length > 0) {
            this.searchSignals(this._allSignals$.getValue());
        }
    }

    private _search(input: Signal[]): Observable<SearchResult> {
        const { sortColumn, sortDirection, pageSize, page, searchTerm } = this._state;

        // 1. sort
        let signals = sort(input, sortColumn, sortDirection);
        // 2. filter
        signals = signals.filter(signal => matches(signal, searchTerm, this.pipe));
        const total = signals.length;
        // 3. paginate
        signals = signals.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
        // 4. store all signals
        this._allSignals$.next(input);

        return of({ signals, total });
    }
}
