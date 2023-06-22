import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { QRCodeModule } from 'angularx-qrcode';

import { Setup2faComponent } from './setup-2fa/profile.setup2fa';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        QRCodeModule
    ],
    declarations: [
        Setup2faComponent
    ],
    exports: [
        Setup2faComponent
    ]
})


export class ProfileModule { }