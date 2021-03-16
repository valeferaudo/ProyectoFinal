import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


//MODULOS
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressBarModule} from '@angular/material/progress-bar';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    // MatStepperModule,
    // MatFormFieldModule,
    // MatIconModule,
    // MatButtonModule,
     MatProgressSpinnerModule,
    // MatSelectModule,
    // MatCheckboxModule,
     MatProgressBarModule,
    // MatSlideToggleModule,
    // MatSliderModule,
    // MatMenuModule,
    // MatRadioModule
  ],
  exports:[
    // MatStepperModule,
    // MatFormFieldModule,
    // MatIconModule,
    // MatButtonModule,
     MatProgressSpinnerModule,
    // MatSelectModule,
    // MatCheckboxModule,
     MatProgressBarModule,
    // MatSlideToggleModule,
    // MatSliderModule,
    // MatMenuModule,
    // MatRadioModule
    
  ],
})
export class MaterialModule { }
