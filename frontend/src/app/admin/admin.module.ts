import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { AppRoutingModule } from '../app-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Components
 import { AdminComponent } from './admin.component';
import { AdminHomeComponent } from './admin-pages/admin-home/admin-home.component';
import { AdminAppointmentsComponent } from './admin-pages/admin-appointments/admin-appointments.component';
import { AdminDoAppointmentsComponent } from './admin-pages/admin-do-appointments/admin-do-appointments.component';
import { AdminSettingComponent } from './admin-pages/admin-setting/admin-setting.component';
import { AdminFieldComponent } from './admin-pages/admin-field/admin-field.component';
import { AdminFieldsComponent } from './admin-pages/admin-fields/admin-fields.component';
import { ComponentsModule } from '../components/components.module';
import { PipesModule } from '../pipes/pipes.module';


@NgModule({
  declarations: [
     AdminComponent,
     AdminHomeComponent,
     AdminAppointmentsComponent,
     AdminDoAppointmentsComponent,
     AdminSettingComponent,
     AdminFieldComponent,
     AdminFieldsComponent
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    SharedModule,
    ComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
  ],
  exports: [
     AdminComponent,
     AdminHomeComponent,
     AdminAppointmentsComponent,
     AdminDoAppointmentsComponent,
     AdminSettingComponent,
     AdminFieldComponent,
     AdminFieldsComponent
  ]
})
export class AdminModule { }
