import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { AppRoutingModule } from '../app-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgmCoreModule } from '@agm/core';

// Components
 import { AdminComponent } from './admin.component';
import { AdminHomeComponent } from './admin-pages/admin-home/admin-home.component';
import { AdminAppointmentsComponent } from './admin-pages/admin-appointments/admin-appointments.component';
import { AdminDoAppointmentsComponent } from './admin-pages/admin-do-appointments/admin-do-appointments.component';
import { AdminSettingComponent } from './admin-pages/admin-setting/admin-setting.component';
import { AdminFieldsComponent } from './admin-pages/admin-fields/admin-fields.component';
import { ComponentsModule } from '../components/components.module';
import { PipesModule } from '../pipes/pipes.module';
import { UsersComponent } from './super-admin-pages/users/users.component';
import { SportsComponent } from './super-admin-pages/sports/sports.component';
import { ServicesComponent } from './super-admin-pages/services/services.component';
import { FeaturesComponent } from './super-admin-pages/features/features.component';
import { SportCentersComponent } from './super-admin-pages/sport-centers/sport-centers.component';
import { SportCenterComponent } from './admin-pages/sport-center/sport-center.component';
import { MaterialModule } from '../material.module';
import { AdminRequestsComponent } from './admin-pages/admin-requests/admin-requests.component';
import { RequestDoComponent } from './super-admin-pages/request-do/request-do.component';
import { AdminUsersComponent } from './admin-pages/admin-users/admin-users.component';
import { AdminPaymentsComponent } from './admin-pages/admin-payments/admin-payments.component';


@NgModule({
  declarations: [
     AdminComponent,
     AdminHomeComponent,
     AdminAppointmentsComponent,
     AdminDoAppointmentsComponent,
     AdminSettingComponent,
     AdminFieldsComponent,
     UsersComponent,
     SportsComponent,
     ServicesComponent,
     FeaturesComponent,
     SportCentersComponent,
     SportCenterComponent,
     AdminRequestsComponent,
     RequestDoComponent,
     AdminUsersComponent,
     AdminPaymentsComponent,
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    SharedModule,
    ComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    MaterialModule,
    NgbModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyD3VgKPKtNrPpr-86YZT-s7SFLJtHSHyU4'
    })
  ],
  exports: [
     AdminComponent,
     AdminHomeComponent,
     AdminAppointmentsComponent,
     AdminDoAppointmentsComponent,
     AdminSettingComponent,
     AdminFieldsComponent
  ]
})
export class AdminModule { }
