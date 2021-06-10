import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//MODULOS
import { AppRoutingModule } from '../app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ComponentsModule } from '../components/components.module';
import { MaterialModule } from '../material.module';

//COMPONENTES
import { PagesComponent } from './pages.component';
import { HomeComponent } from './home/home.component';
import { UsersComponent } from './users/users.component';
import { AboutComponent } from '../shared/about/about.component';
import { FieldsComponent } from './fields/fields.component';
import { DoAppointmentComponent } from './do-appointment/do-appointment.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { SportCentersComponent } from './sport-centers/sport-centers.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { PaymentsComponent } from './payments/payments.component';
import { SearchComponent } from './search/search.component';


@NgModule({
  declarations: [
    PagesComponent,
    HomeComponent,
    UsersComponent,
    AboutComponent,
    FieldsComponent,
    DoAppointmentComponent,
    AppointmentsComponent,
    SportCentersComponent,
    FavoritesComponent,
    PaymentsComponent,
    SearchComponent
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    ComponentsModule,
    MaterialModule
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
