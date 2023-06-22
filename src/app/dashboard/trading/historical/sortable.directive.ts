import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { Historical } from 'src/app/interface/historical';

export type HistoricalSortColumn = keyof Historical | '';
export type HistoricalSortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: HistoricalSortDirection } = { 'asc': 'desc', 'desc': '', '': 'asc' };

export interface HistoricalSortEvent {
  column: HistoricalSortColumn;
  direction: HistoricalSortDirection;
}

@Directive({
  selector: 'th[sortablehistorical]',
  host: {
    '[class.asc]': 'directionhistorical === "asc"',
    '[class.desc]': 'directionhistorical === "desc"',
    '(click)': 'rotate()'
  }
})
export class HistoricalSortableHeader {

  @Input() sortablehistorical: HistoricalSortColumn = '';
  @Input() directionhistorical: HistoricalSortDirection = '';
  @Output() sorthistorical = new EventEmitter<HistoricalSortEvent>();

  rotate() {
    this.directionhistorical = rotate[this.directionhistorical];
    this.sorthistorical.emit({ column: this.sortablehistorical, direction: this.directionhistorical });
  }
}
