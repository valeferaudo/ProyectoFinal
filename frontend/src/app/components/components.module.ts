import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// MODULOS
import { ReactiveFormsModule } from '@angular/forms'; 
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
import { ChartRadarComponent } from './charts/chart-radar/chart-radar.component'


@NgModule({
  declarations: [
    UserSettingComponent,
    CardFieldComponent,
    TableAppointmentComponent,
    TableDoAppointmentComponent,
    ChartBarComponent,
    ChartLineComponent,
    ChartDoughnutComponent,
    ChartRadarComponent

  ],
  imports: [
    CommonModule,
    PipesModule,
    ReactiveFormsModule,
    ChartsModule
  ],
  exports: [
    UserSettingComponent,
    CardFieldComponent,
    TableAppointmentComponent,
    TableDoAppointmentComponent,
    ChartBarComponent,
    ChartLineComponent,
    ChartDoughnutComponent,
    ChartRadarComponent
  ]
})
export class ComponentsModule { }
