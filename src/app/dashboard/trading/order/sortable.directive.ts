import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { ActiveOrder } from 'src/app/interface/active-order';

export type OrderSortColumn = keyof ActiveOrder | '';
export type OrderSortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: OrderSortDirection } = { 'asc': 'desc', 'desc': '', '': 'asc' };

export interface OrderSortEvent {
  column: OrderSortColumn;
  direction: OrderSortDirection;
}

@Directive({
  selector: 'th[sortableorder]',
  host: {
    '[class.asc]': 'directionorder === "asc"',
    '[class.desc]': 'directionorder === "desc"',
    '(click)': 'rotate()'
  }
})
export class OrderSortableHeader {

  @Input() sortableorder: OrderSortColumn = '';
  @Input() directionorder: OrderSortDirection = '';
  @Output() sortorder = new EventEmitter<OrderSortEvent>();

  rotate() {
    this.directionorder = rotate[this.directionorder];
    this.sortorder.emit({ column: this.sortableorder, direction: this.directionorder });
  }
}
