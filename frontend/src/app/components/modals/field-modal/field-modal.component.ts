import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { CombineLatestOperator } from 'rxjs/internal/observable/combineLatest';
import { Combo } from 'src/app/interfaces/combo.interface';
import { Field } from 'src/app/models/field.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { FeatureService } from 'src/app/services/feature.service';
import { FieldService } from 'src/app/services/field.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UploadFileService } from 'src/app/services/upload-file.service';

@Component({
  selector: 'app-field-modal',
  templateUrl: './field-modal.component.html',
  styleUrls: ['./field-modal.component.css']
})
export class FieldModalComponent implements OnInit {

  @Input() hiddenModal: boolean;
  @Input() mode: 'create' | 'update';
  @Input() fieldSelected: Field;
  @Input() sportCenterID: string;
  @Output() closeModal = new EventEmitter<string>();
  @Output() getFields = new EventEmitter<string>();
  @Output() newField = new EventEmitter<Field>();

  fieldForm: FormGroup;
  formsEquals: boolean = true;
  images: File [] = []
  doNotCloseMenu = (event) => event.stopPropagation();
  @ViewChildren('myCheckBoxFeature') private myCheckboxesFeature : QueryList<any>;
  featureCombo: Combo [] = [];
  featuresSelected: string [] = [];

  constructor(private fieldService: FieldService,
              private featureService: FeatureService,
              private fb: FormBuilder,
              private errorService: ErrorsService,
              private loaderService: LoaderService,
              private uploadFileService: UploadFileService,
              private sweetAlertService: SweetAlertService) {}
    
  ngOnInit(): void {
    this.createFieldForm();
    this.getFeatureCombo();
    this.getMode();
  }
  getMode(){
    if(this.mode === 'update'){
      this.getField();
      this.listenerForm();
    }
  }
  getField(){
    this.loaderService.openLineLoader();
    this.fieldService.getField(this.fieldSelected.id)
                .subscribe((resp: any) =>{
                  this.loaderService.closeLineLoader();
                  if(resp.ok){
                    this.fieldSelected = resp.param.field;
                    this.fillForm();
                  }
                },(err) => {
                  console.log(err);
                  this.loaderService.closeLineLoader();
                  this.errorService.showErrors(err.error.code,err.error.msg);
                })
  }
  fillForm(){
    this.fieldForm.patchValue({
      name: this.fieldSelected.name,
      description: this.fieldSelected.description,
      sizes: this.fieldSelected.sizes,
      duration: this.fieldSelected.duration,
      features: this.fieldSelected.features,
      sportCenter: this.sportCenterID,
      price: this.fieldSelected.price
    })
    this.fillCheckBox();
  }
  getFeatureCombo(){
    this.featureService.getCombo()
                  .subscribe((resp: any)=>{
                    if(resp.ok){
                      this.featureCombo = resp.param.combo
                    }
                  },(err)=>{
                    console.log(err);
                    this.loaderService.closeLineLoader();
                    this.errorService.showErrors(err.error.code,err.error.msg);
                  })
  }
  createFieldForm(){
    this.fieldForm = this.fb.group({
      name:["",[Validators.required],],
      description:["",[],],
      sizes:["",[],],
      duration:["",[Validators.required],],
      features:[[],[],],
      sportCenter: [this.sportCenterID,[Validators.required]],
      price: [,[Validators.required],],
    })
  }
  closedModal(){
    this.closeModal.emit()
  }
  createField(){
    if (this.fieldForm.invalid){
      Object.values(this.fieldForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Crear cancha?',
      text: ``,
      icon: 'question'})
    .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.fieldService.createField(this.fieldForm.value)
                    .subscribe((resp: any) =>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        if(this.images.length > 0){
                          this.updateImages(resp.param.field.id);
                        }
                        else{
                          this.sweetAlertService.showSwalResponse({
                            title: 'Cancha creada',
                            text:'(Sin imágenes)',
                            icon: 'success'
                          })
                        }
                        this.newField.emit(resp.param.field)
                        this.getFields.emit();
                        this.closedModal();                      }
                    },(err)=>{
                      console.log(err);
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(err.error.code,err.error.msg);
                    })
      }
    })
  }
  updateField(){
    if (this.fieldForm.invalid){
      Object.values(this.fieldForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Editar cancha?',
      text: ``,
      icon: 'question'})
    .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.fieldService.updateField(this.fieldSelected.id,this.fieldForm.value)
                    .subscribe((resp: any) =>{
                      if(resp.ok){
                        if(this.images.length > 0){
                          this.updateImages(resp.param.field.id);
                        }
                        else{
                          this.sweetAlertService.showSwalResponse({
                            title: 'Cancha editada',
                            text:'(Sin imágenes)',
                            icon: 'success'
                          })
                        }
                        this.getFields.emit();
                        this.closedModal();
                      }
                    },(err)=>{
                      console.log(err);
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(err.error.code,err.error.msg);
                    })
      }
    })
  }
  listenerForm(){
    this.fieldForm.valueChanges
            .subscribe(resp=>{
              if(this.fieldSelected.name === this.fieldForm.controls['name'].value && this.fieldSelected.description === this.fieldForm.controls['description'].value){
                this.formsEquals = true;
              }
              else{
                this.formsEquals = false;
              }
            })
  }
  getFieldValid(field : string){
    return this.fieldForm.get(field).invalid &&
            this.fieldForm.get(field).touched
  }
  changeFeatureSelected(event:MatCheckboxChange,feature){
    if(event.checked){
      this.featuresSelected.push(feature.id)
    }
    else{
      let index = 0;
      this.featuresSelected.forEach(element => {
        if(element === feature.id){
          this.featuresSelected.splice(index,1);
          return;
        }
        index = index + 1;
      });
    }
  }
  resetFeatures(){
    let myCheckboxes = this.myCheckboxesFeature.toArray();
    for (let index = 0; index < myCheckboxes.length; index++) {
      myCheckboxes[index].checked = false;
    }
    this.featuresSelected = [];
    this.setFeatures();
  }
  setFeatures(){
    this.fieldForm.patchValue({
      features: this.featuresSelected
    })
  }
  fillCheckBox(){
    if(this.fieldSelected !== null){
      this.fieldSelected.features.forEach(element => {
        this.featuresSelected.push(element._id)
      });
    }
  }
  updateImages(fieldID){
    this.uploadFileService.uploadImage(this.images,'field',fieldID)
                    .then((resp: any) =>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.sweetAlertService.showSwalResponse({
                          title: 'Cancha editada',
                          text:'(Con imágenes)',
                          icon: 'success'
                        })
                      }
                    },(err)=>{
                      console.log(err);
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(err.error.code,err.error.msg);
                    })
  }
  setImages(images){
    this.images = images;
  }
  deleteImage(image){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Eliminar imagen?',
      text: ``,
      icon: 'question'})
    .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.uploadFileService.deleteImage(image, this.fieldSelected.id, 'field')
                    .subscribe((resp: any) =>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.sweetAlertService.showSwalResponse({
                          title: 'Imagen eliminada',
                          text:'',
                          icon: 'success'
                        })
                        this.deleteArrayImage(image);
                      }
                    },(err)=>{
                      console.log(err);
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(err.error.code,err.error.msg);
                    })
      }
    })
  }
  deleteArrayImage(imageDeleted){
    this.fieldSelected.images = this.fieldSelected.images.filter(image => image !== imageDeleted)
  }
}
