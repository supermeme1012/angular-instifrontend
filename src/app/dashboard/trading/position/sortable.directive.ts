import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { Position } from 'src/app/interface/position';

export type PositionSortColumn = keyof Position | '';
export type PositionSortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: PositionSortDirection } = { 'asc': 'desc', 'desc': '', '': 'asc' };

export interface PositionSortEvent {
  column: PositionSortColumn;
  direction: PositionSortDirection;
}

@Directive({
  selector: 'th[sortableposition]',
  host: {
    '[class.asc]': 'directionposition === "asc"',
    '[class.desc]': 'directionposition === "desc"',
    '(click)': 'rotate()'
  }
})
export class PositionSortableHeader {

  @Input() sortableposition: PositionSortColumn = '';
  @Input() directionposition: PositionSortDirection = '';
  @Output() sortposition = new EventEmitter<PositionSortEvent>();

  rotate() {
    this.directionposition = rotate[this.directionposition];
    this.sortposition.emit({ column: this.sortableposition, direction: this.directionposition });
  }
}
