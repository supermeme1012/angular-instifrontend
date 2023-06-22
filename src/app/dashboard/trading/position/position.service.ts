import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Position } from 'src/app/interface/position';
import { DecimalPipe } from '@angular/common';
import { PositionSortColumn, PositionSortDirection } from './sortable.directive';

interface SearchResult {
    positions: Position[];
    total: number;
}

interface State {
    page: number;
    pageSize: number;
    searchTerm: string;
    sortColumn: PositionSortColumn;
    sortDirection: PositionSortDirection;
}

const compare = (v1: string | number | boolean | Date, v2: string | number | boolean | Date) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(clients: Position[], column: PositionSortColumn, direction: string): Position[] {
    if (direction === '' || column === '') {
        return clients;
    } else {
        return [...clients].sort((a, b) => {
            const res = compare(a[column], b[column]);
            return direction === 'asc' ? res : -res;
        });
    }
}

function matches(position: Position, term: string, pipe: PipeTransform) {
    return position.ProductName.toLowerCase().includes(term.toLowerCase())
        || position.Symbol.toLowerCase().includes(term.toLowerCase())
        || position.Position.toLowerCase().includes(term.toLowerCase())
        || pipe.transform(position.Quantity).includes(term)
        || pipe.transform(position.UnrealizedPL).includes(term)
        || pipe.transform(position.AvgEntryPrice).includes(term)
        || pipe.transform(position.Allocation).includes(term);
}

@Injectable({ providedIn: 'root' })
export class PositionService {
    private _loading$ = new BehaviorSubject<boolean>(false);
    private _positions$ = new BehaviorSubject<Position[]>([]);
    private _allPositions$ = new BehaviorSubject<Position[]>([]);
    private _total$ = new BehaviorSubject<number>(0);

    private _state: State = {
        page: 1,
        pageSize: 10,
        searchTerm: '',
        sortColumn: '',
        sortDirection: ''
    };

    constructor(private pipe: DecimalPipe) { }

    get positions$() { return this._positions$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }
    get page() { return this._state.page; }
    get pageSize() { return this._state.pageSize; }
    get searchTerm() { return this._state.searchTerm; }

    set page(page: number) { this._set({ page }); }
    set pageSize(pageSize: number) { this._set({ pageSize }); }
    set searchTerm(searchTerm: string) { this._set({ searchTerm }); }
    set sortColumn(sortColumn: PositionSortColumn) { this._set({ sortColumn }); }
    set sortDirection(sortDirection: PositionSortDirection) { this._set({ sortDirection }); }

    searchPositions(positions: Position[]) {
        this._loading$.next(true)
        this._search(positions).subscribe(result => {
            this._positions$.next(result.positions);
            this._total$.next(result.total);
            this._loading$.next(false)
        });
    }

    private _set(patch: Partial<State>) {
        Object.assign(this._state, patch);
        if (this._allPositions$.getValue().length > 0) {
            this.searchPositions(this._allPositions$.getValue());
        }
    }

    private _search(input: Position[]): Observable<SearchResult> {
        const { sortColumn, sortDirection, pageSize, page, searchTerm } = this._state;

        // 1. sort
        let positions = sort(input, sortColumn, sortDirection);
        // 2. filter
        positions = positions.filter(position => matches(position, searchTerm, this.pipe));
        const total = positions.length;
        // 3. paginate
        positions = positions.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
        // 4. store all positions
        this._allPositions$.next(input);

        return of({ positions, total });
    }
}
