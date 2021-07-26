import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// MODULOS
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { PipesModule } from '../pipes/pipes.module';
import { ChartsModule } from 'ng2-charts';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialModule } from '../material.module';
import { AgmCoreModule } from '@agm/core';

// COMPONENTES
import { UserSettingComponent } from './user-setting/user-setting.component';
import { CardFieldComponent } from './cards/card-field/card-field.component';
import { TableAppointmentComponent } from './tables/table-appointment/table-appointment.component';
import { TableDoAppointmentComponent } from './tables/table-do-appointment/table-do-appointment.component';
import { ForgetPasswordModalComponent } from './modals/forget-password-modal/forget-password-modal.component';
import { ChangePasswordModalComponent } from './modals/change-password-modal/change-password-modal.component';
import { FullScreenLoaderComponent } from './loaders/full-screen-loader/full-screen-loader.component';
import { LineLoaderComponent } from './loaders/line-loader/line-loader.component'
import { TableUserComponent } from './tables/table-user/table-user.component';
import { SportCenterModalComponent } from './modals/sport-center-modal/sport-center-modal.component';
import { SportModalComponent } from './modals/sport-modal/sport-modal.component';
import { ServiceModalComponent } from './modals/service-modal/service-modal.component';
import { FeatureModalComponent } from './modals/feature-modal/feature-modal.component';
import { SportCenterInfoModalComponent } from './modals/sport-center-info-modal/sport-center-info-modal.component';
import { FieldModalComponent } from './modals/field-modal/field-modal.component';
import { FieldSportModalComponent } from './modals/field-sport-modal/field-sport-modal.component';
import { SportCenterScheduleModalComponent } from './modals/sport-center-schedule-modal/sport-center-schedule-modal.component';
import { UserModalComponent } from './modals/user-modal/user-modal.component';
import { ImageDropZoneModalComponent } from './modals/image-drop-zone-modal/image-drop-zone-modal.component';
import { CarouselImagesComponent } from './carousels/carousel-images/carousel-images.component';
import { CardSportCenterComponent } from './cards/card-sport-center/card-sport-center.component';
import { SportCenterServiceModalComponent } from './modals/sport-center-service-modal/sport-center-service-modal.component';
import { CarouselAppointmentComponent } from './carousels/carousel-appointment/carousel-appointment.component';
import { PriceHistorialModalComponent } from './modals/price-historial-modal/price-historial-modal.component';
import { SpecialScheduleInfoModalComponent } from './modals/special-schedule-info-modal/special-schedule-info-modal.component';
import { SpecialScheduleCreateModalComponent } from './modals/special-schedule-create-modal/special-schedule-create-modal.component';
import { OnePointMapComponent } from './maps/one-point-map/one-point-map.component';
import { GpsMapComponent } from './maps/gps-map/gps-map.component';
import { ApprovePaymentComponent } from './modals/approve-payment/approve-payment.component';
import { AddPaymentComponent } from './modals/add-payment/add-payment.component';
import { PaymentRequiredInfoComponent } from './modals/payment-required-info/payment-required-info.component';


@NgModule({
  declarations: [
    UserSettingComponent,
    CardFieldComponent,
    TableAppointmentComponent,
    TableDoAppointmentComponent,
    ForgetPasswordModalComponent,
    ChangePasswordModalComponent,
    FullScreenLoaderComponent,
    LineLoaderComponent,
    TableUserComponent,
    SportCenterModalComponent,
    SportModalComponent,
    ServiceModalComponent,
    FeatureModalComponent,
    SportCenterInfoModalComponent,
    FieldModalComponent,
    FieldSportModalComponent,
    SportCenterScheduleModalComponent,
    UserModalComponent,
    ImageDropZoneModalComponent,
    CarouselImagesComponent,
    CardSportCenterComponent,
    SportCenterServiceModalComponent,
    CarouselAppointmentComponent,
    PriceHistorialModalComponent,
    SpecialScheduleInfoModalComponent,
    SpecialScheduleCreateModalComponent,
    OnePointMapComponent,
    GpsMapComponent,
    ApprovePaymentComponent,
    AddPaymentComponent,
    PaymentRequiredInfoComponent,

  ],
  imports: [
    FormsModule,
    CommonModule,
    PipesModule,
    ReactiveFormsModule,
    ChartsModule,
    MaterialModule,
    NgxDropzoneModule,
    NgbModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyD3VgKPKtNrPpr-86YZT-s7SFLJtHSHyU4'
    })
  ],
  exports: [
    UserSettingComponent,
    CardFieldComponent,
    TableAppointmentComponent,
    TableDoAppointmentComponent,
    ForgetPasswordModalComponent,
    ChangePasswordModalComponent,
    FullScreenLoaderComponent,
    LineLoaderComponent,
    TableUserComponent,
    SportCenterModalComponent,
    SportModalComponent,
    ServiceModalComponent,
    FeatureModalComponent,
    SportCenterInfoModalComponent,
    FieldModalComponent,
    FieldSportModalComponent,
    SportCenterScheduleModalComponent,
    UserModalComponent,
    ImageDropZoneModalComponent,
    CarouselImagesComponent,
    CardSportCenterComponent,
    SportCenterServiceModalComponent,
    CarouselAppointmentComponent,
    PriceHistorialModalComponent,
    SpecialScheduleCreateModalComponent,
    SpecialScheduleInfoModalComponent,
    OnePointMapComponent,
    GpsMapComponent,
    ApprovePaymentComponent,
    AddPaymentComponent,
    PaymentRequiredInfoComponent
  ]
})
export class ComponentsModule { }
