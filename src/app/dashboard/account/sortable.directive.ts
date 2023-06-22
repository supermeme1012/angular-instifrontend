import {Directive, EventEmitter, Input, Output} from '@angular/core';
import { Client } from 'src/app/interface/client';

export type ClientListSortColumn = keyof Client | '';
export type ClientListSortDirection = 'asc' | 'desc' | '';
const rotate: {[key: string]: ClientListSortDirection} = { 'asc': 'desc', 'desc': '', '': 'asc' };

export interface ClientListSortEvent {
  column: ClientListSortColumn;
  direction: ClientListSortDirection;
}

@Directive({
  selector: 'th[sortable]',
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()'
  }
})
export class ClientListSortableHeader {

  @Input() sortable: ClientListSortColumn = '';
  @Input() direction: ClientListSortDirection = '';
  @Output() sort = new EventEmitter<ClientListSortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({column: this.sortable, direction: this.direction});
  }
}
