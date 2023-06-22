import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireModule, FIREBASE_OPTIONS} from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { AppRoutingModule } from './app-routing.module';
import { InitModule } from './init.module';
import { HttpErrorHandler } from './common/http-error-handler.service';
import { MessageService } from './common/message.service';
import { BroadcastService } from './common/broadcast.service';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { HomeComponent } from './home/home.component';
import { ForgetComponent } from './home/forget/home.forget';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProfileModule } from './profile/profile.module';


// initialize app with empty config
const angularFireImport = AngularFireModule.initializeApp({});

// remove the provider that we have provided for in the main.ts
if(angularFireImport.providers){
  angularFireImport.providers = angularFireImport.providers.filter(
    (provider: any) => provider.provide !== FIREBASE_OPTIONS
  );
}

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ForgetComponent,
    HomeComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    InitModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    angularFireImport,
    AngularFirestoreModule,
    DashboardModule,
    ProfileModule
  ],
  providers: [
    HttpErrorHandler,
    MessageService,
    BroadcastService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
