import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { Signal } from 'src/app/interface/signal';

export type SignalSortColumn = keyof Signal | '';
export type SignalSortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: SignalSortDirection } = { 'asc': 'desc', 'desc': '', '': 'asc' };

export interface SignalSortEvent {
  column: SignalSortColumn;
  direction: SignalSortDirection;
}

@Directive({
  selector: 'th[sortablesignal]',
  host: {
    '[class.asc]': 'directionsignal === "asc"',
    '[class.desc]': 'directionsignal === "desc"',
    '(click)': 'rotate()'
  }
})
export class SignalSortableHeader {

  @Input() sortablesignal: SignalSortColumn = '';
  @Input() directionsignal: SignalSortDirection = '';
  @Output() sortsignal = new EventEmitter<SignalSortEvent>();

  rotate() {
    this.directionsignal = rotate[this.directionsignal];
    this.sortsignal.emit({ column: this.sortablesignal, direction: this.directionsignal });
  }
}
