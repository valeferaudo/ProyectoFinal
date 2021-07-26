import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Feature } from 'src/app/models/feature.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { FeatureService } from 'src/app/services/feature.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-feature-modal',
  templateUrl: './feature-modal.component.html',
  styleUrls: ['./feature-modal.component.css']
})
export class FeatureModalComponent implements OnInit {

  @Input() hiddenModal: boolean;
  @Input() mode: 'create' | 'update';
  @Input() featureSelected: Feature;
  @Output() closeModal = new EventEmitter<string>();
  @Output() getFeatures = new EventEmitter<string>();

  featureForm: FormGroup;
  feature: Feature;
  formsEquals: boolean = true;
  constructor(private featureService: FeatureService,
              private fb: FormBuilder,
              private errorService: ErrorsService,
              private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService) {}
    
    ngOnInit(): void {
      this.createFeatureForm();
      this.getMode();
  }
  getMode(){
    if(this.mode === 'update'){
      this.featureForm.patchValue({
        name: this.featureSelected.name,
        description: this.featureSelected.description
      })
      this.listenerForm();
    }
  }
  createFeatureForm(){
    this.featureForm = this.fb.group({
      name:["",[Validators.required],],
      description:["",[],]
    })
  }
  closedModal(){
    this.closeModal.emit()
  }
  createFeature(){
    if (this.featureForm.invalid){
      Object.values(this.featureForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Crear característica?',
      text: ``,
      icon: 'question'})
    .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.featureService.createFeature(this.featureForm.value)
                    .subscribe((resp: any) =>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.sweetAlertService.showSwalResponse({
                          title: 'Característica creada',
                          text:'',
                          icon: 'success'
                        })
                        this.getFeatures.emit();
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
  updateFeature(){
    if (this.featureForm.invalid){
      Object.values(this.featureForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Editar característica?',
      text: ``,
      icon: 'question'})
    .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.featureService.updateFeature(this.featureSelected.id,this.featureForm.value)
                    .subscribe((resp: any) =>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.sweetAlertService.showSwalResponse({
                          title: 'Característica editada',
                          text:'',
                          icon: 'success'
                        })
                        this.getFeatures.emit();
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
    this.featureForm.valueChanges
            .subscribe(resp=>{
              if(this.featureSelected.name === this.featureForm.controls['name'].value && this.featureSelected.description === this.featureForm.controls['description'].value){
                this.formsEquals = true;
              }
              else{
                this.formsEquals = false;
              }
            })
  }
  getFieldValid(field : string){
    return this.featureForm.get(field).invalid &&
            this.featureForm.get(field).touched
  }

}
