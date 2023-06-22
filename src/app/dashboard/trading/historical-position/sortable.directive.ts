import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { HistoricalPos } from 'src/app/interface/historical-pos';

export type HistoricalPosSortColumn = keyof HistoricalPos | '';
export type HistoricalPosSortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: HistoricalPosSortDirection } = { 'asc': 'desc', 'desc': '', '': 'asc' };

export interface HistoricalPosSortEvent {
  column: HistoricalPosSortColumn;
  direction: HistoricalPosSortDirection;
}

@Directive({
  selector: 'th[sorthistoricalpos]',
  host: {
    '[class.asc]': 'directionhistorical === "asc"',
    '[class.desc]': 'directionhistorical === "desc"',
    '(click)': 'rotate()'
  }
})
export class HistoricalPosSortableHeader {

  @Input() sortablehistoricalpos: HistoricalPosSortColumn = '';
  @Input() directionhistorical: HistoricalPosSortDirection = '';
  @Output() sorthistoricalpos = new EventEmitter<HistoricalPosSortEvent>();

  rotate() {
    this.directionhistorical = rotate[this.directionhistorical];
    this.sorthistoricalpos.emit({ column: this.sortablehistoricalpos, direction: this.directionhistorical });
  }
}
