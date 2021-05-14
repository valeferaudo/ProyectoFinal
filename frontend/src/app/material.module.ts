import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


//MODULOS
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatMenuModule} from '@angular/material/menu';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatRadioModule} from '@angular/material/radio';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import {MatSliderModule} from '@angular/material/slider'; 

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    // MatStepperModule,
     MatFormFieldModule,
    // MatIconModule,
     MatButtonModule,
     MatProgressSpinnerModule,
     MatSelectModule,
     MatCheckboxModule,
     MatProgressBarModule,
     MatSlideToggleModule,
     MatSliderModule,
     MatMenuModule,
     MatRadioModule,
     MatDatepickerModule,
     MatNativeDateModule
  ],
  exports:[
    // MatStepperModule,
     MatFormFieldModule,
    // MatIconModule,
     MatButtonModule,
     MatProgressSpinnerModule,
     MatSelectModule,
     MatCheckboxModule,
     MatProgressBarModule,
     MatSlideToggleModule,
     MatSliderModule,
     MatMenuModule,
     MatRadioModule,
     MatDatepickerModule,
     MatNativeDateModule
    
  ],
})
export class MaterialModule { }
