import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// MODULOS
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { PipesModule } from '../pipes/pipes.module';
import { ChartsModule } from 'ng2-charts';

// COMPONENTES
import { UserSettingComponent } from './user-setting/user-setting.component';
import { CardFieldComponent } from './card-field/card-field.component';
import { TableAppointmentComponent } from './table-appointment/table-appointment.component';
import { TableDoAppointmentComponent } from './table-do-appointment/table-do-appointment.component';
import { ChartBarComponent } from './charts/chart-bar/chart-bar.component'
import { ChartLineComponent } from './charts/chart-line/chart-line.component'
import { ChartDoughnutComponent } from './charts/chart-doughnut/chart-doughnut.component'
import { ChartRadarComponent } from './charts/chart-radar/chart-radar.component';
import { ForgetPasswordModalComponent } from './modals/forget-password-modal/forget-password-modal.component';
import { ChangePasswordModalComponent } from './modals/change-password-modal/change-password-modal.component';
import { FullScreenLoaderComponent } from './loaders/full-screen-loader/full-screen-loader.component';
import { LineLoaderComponent } from './loaders/line-loader/line-loader.component'
import { MaterialModule } from '../material.module';
import { TableUserComponent } from './table-user/table-user.component';
import { SportCenterModalComponent } from './modals/sport-center-modal/sport-center-modal.component';
import { SportModalComponent } from './modals/sport-modal/sport-modal.component';
import { ServiceModalComponent } from './modals/service-modal/service-modal.component';


@NgModule({
  declarations: [
    UserSettingComponent,
    CardFieldComponent,
    TableAppointmentComponent,
    TableDoAppointmentComponent,
    ChartBarComponent,
    ChartLineComponent,
    ChartDoughnutComponent,
    ChartRadarComponent,
    ForgetPasswordModalComponent,
    ChangePasswordModalComponent,
    FullScreenLoaderComponent,
    LineLoaderComponent,
    TableUserComponent,
    SportCenterModalComponent,
    SportModalComponent,
    ServiceModalComponent

  ],
  imports: [
    FormsModule,
    CommonModule,
    PipesModule,
    ReactiveFormsModule,
    ChartsModule,
    MaterialModule
  ],
  exports: [
    UserSettingComponent,
    CardFieldComponent,
    TableAppointmentComponent,
    TableDoAppointmentComponent,
    ChartBarComponent,
    ChartLineComponent,
    ChartDoughnutComponent,
    ChartRadarComponent,
    ForgetPasswordModalComponent,
    ChangePasswordModalComponent,
    FullScreenLoaderComponent,
    LineLoaderComponent,
    TableUserComponent,
    SportCenterModalComponent,
    SportModalComponent,
    ServiceModalComponent
  ]
})
export class ComponentsModule { }
