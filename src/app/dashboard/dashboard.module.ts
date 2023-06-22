import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSliderModule } from '@angular-slider/ngx-slider';

import { AccountComponent } from './account/dashboard.account';
import { TradingComponent } from './trading/dashboard.trading';
import { WatchlistComponent } from './watchlist/dashboard.watchlist';
import { OverviewComponent } from './trading/overview/dashboard.overview';
import { PositionComponent } from './trading/position/dashboard.position';
import { SignalComponent } from './trading/signal/dashboard.signal';
import { OrderComponent } from './trading/order/dashboard.order';
import { HistoricalComponent } from './trading/historical/dashboard.historical';
import { HistoricalPosComponent } from './trading/historical-position/dashboard.historicalPos';
import { PlaceOrderModal } from './trading/place-order/dashboard.place-order';
import { LiquidateModal } from './trading/liquidate/dashboard.liquidate';
import { ConfigureModal } from './trading/configure/dashboard.configure';
import { ClientModal } from './account/add-client/dashboard.client';
import { CloseModal } from './trading/close-position/dashboard.close';
import { AutoStatusModal } from './trading/auto-status/dashboard.auto-status';
import { RemoveClientModal } from './account/remove-client/dashboard.remove-client';
import { CancelOrderModal } from './trading/cancel-order/dashboard.cancel-order';
import { ClientListSortableHeader } from './account/sortable.directive';
import { WatchlistListSortableHeader } from './watchlist/sortable.directive';
import { SignalSortableHeader } from './trading/signal/sortable.directive';
import { PositionSortableHeader } from './trading/position/sortable.directive';
import { OrderSortableHeader } from './trading/order/sortable.directive';
import { HistoricalSortableHeader } from './trading/historical/sortable.directive';
import { HistoricalPosSortableHeader } from './trading/historical-position/sortable.directive';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgxSliderModule
  ],
  declarations: [
    ClientListSortableHeader,
    WatchlistListSortableHeader,
    SignalSortableHeader,
    PositionSortableHeader,
    OrderSortableHeader,
    HistoricalSortableHeader,
    HistoricalPosSortableHeader,
    AccountComponent,
    TradingComponent,
    WatchlistComponent,
    OverviewComponent,
    PositionComponent,
    SignalComponent,
    OrderComponent,
    HistoricalComponent,
    HistoricalPosComponent,
    PlaceOrderModal,
    LiquidateModal,
    ConfigureModal,
    ClientModal,
    CloseModal,
    AutoStatusModal,
    RemoveClientModal,
    CancelOrderModal
  ],
  exports: [
    AccountComponent,
    TradingComponent,
    WatchlistComponent,
    OverviewComponent,
    SignalComponent,
    OrderComponent,
    HistoricalComponent,
    HistoricalPosComponent,
    PositionComponent
  ]
})


export class DashboardModule { }