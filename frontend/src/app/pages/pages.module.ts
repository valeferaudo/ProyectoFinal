import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//MODULOS
import { AppRoutingModule } from '../app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

//COMPONENTES
import { PagesComponent } from './pages.component';
import { HomeComponent } from './home/home.component';
import { UsersComponent } from './users/users.component';
import { AboutComponent } from './about/about.component';
import { FieldsComponent } from './fields/fields.component';
import { DoAppointmentComponent } from './do-appointment/do-appointment.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { ComponentsModule } from '../components/components.module';


@NgModule({
  declarations: [
    PagesComponent,
    HomeComponent,
    UsersComponent,
    AboutComponent,
    FieldsComponent,
    DoAppointmentComponent,
    AppointmentsComponent
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    ComponentsModule
  ],
  exports:[
    PagesComponent,
    HomeComponent,
    UsersComponent,
    AboutComponent,
    FieldsComponent,
    AppointmentsComponent,
    DoAppointmentComponent
  ]
})
export class PagesModule { }
