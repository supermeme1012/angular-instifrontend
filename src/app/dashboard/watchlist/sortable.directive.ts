import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { Product } from 'src/app/interface/product';
import { ScreenerProduct } from 'src/app/interface/screener-product';

export type WatchlistSortColumn = keyof ScreenerProduct | '';
export type WatchlistSortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: WatchlistSortDirection } = { 'asc': 'desc', 'desc': '', '': 'asc' };

export interface WatchlistListSortEvent {
  column: WatchlistSortColumn;
  direction: WatchlistSortDirection;
}

@Directive({
selector: 'th[sortablewatchlist]',
  host: {
    '[class.asc]': 'directionwatchlist === "asc"',
    '[class.desc]': 'directionwatchlist === "desc"',
    '(click)': 'rotate()'
  }
})
export class WatchlistListSortableHeader {

  @Input() sortablewatchlist: WatchlistSortColumn = '';
  @Input() directionwatchlist: WatchlistSortDirection = '';
  @Output() sortwatchlist = new EventEmitter<WatchlistListSortEvent>();

  rotate() {
    this.directionwatchlist = rotate[this.directionwatchlist];
    this.sortwatchlist.emit({ column: this.sortablewatchlist, direction: this.directionwatchlist });
  }
}
