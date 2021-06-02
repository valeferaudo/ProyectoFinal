import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagePipe } from './image.pipe';
import { NoimagePipe } from './noimage.pipe';
import { TranslatePipe } from './translate.pipe';
import { IfNullPipe } from './if-null.pipe';



@NgModule({
  declarations: [
    ImagePipe,
    NoimagePipe,
    TranslatePipe,
    IfNullPipe
],
  imports: [
    CommonModule
  ],
  exports: [
    ImagePipe,
    NoimagePipe,
    TranslatePipe,
    IfNullPipe
  ]
})
export class PipesModule { }
