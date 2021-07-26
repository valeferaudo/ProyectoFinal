import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Service } from 'src/app/models/service.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ServiceService } from 'src/app/services/service.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-service-modal',
  templateUrl: './service-modal.component.html',
  styleUrls: ['./service-modal.component.css']
})
export class ServiceModalComponent implements OnInit {

  @Input() hiddenModal: boolean;
  @Input() mode: 'create' | 'update';
  @Input() serviceSelected: Service;
  @Output() closeModal = new EventEmitter<string>();
  @Output() getServices = new EventEmitter<string>();

  serviceForm: FormGroup
  service: Service;
  formsEquals: boolean = true;
  constructor(private serviceService: ServiceService,
              private fb: FormBuilder,
              private errorService: ErrorsService,
              private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService) {}
    
  ngOnInit(): void {
    this.createServiceForm();
    this.getMode();
  }
  getMode(){
    if(this.mode === 'update'){
      this.serviceForm.patchValue({
        name: this.serviceSelected.name,
        description: this.serviceSelected.description
      })
      this.listenerForm();
    }
  }
  createServiceForm(){
    this.serviceForm = this.fb.group({
      name:["",[Validators.required],],
      description:["",[],]
    })
  }
  closedModal(){
    this.closeModal.emit()
  }
  createService(){
    if (this.serviceForm.invalid){
      Object.values(this.serviceForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Crear servicio?',
      text: ``,
      icon: 'question'})
    .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.serviceService.createService(this.serviceForm.value)
                    .subscribe((resp: any) =>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.sweetAlertService.showSwalResponse({
                          title: 'Servicio creado',
                          text:'',
                          icon: 'success'
                        })
                        this.getServices.emit();
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
  updateService(){
    if (this.serviceForm.invalid){
      Object.values(this.serviceForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Editar servicio?',
      text: ``,
      icon: 'question'})
    .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.serviceService.updateService(this.serviceSelected.id,this.serviceForm.value)
                    .subscribe((resp: any) =>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.sweetAlertService.showSwalResponse({
                          title: 'Servicio editado',
                          text:'',
                          icon: 'success'
                        })
                        this.getServices.emit();
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
    this.serviceForm.valueChanges
            .subscribe(resp=>{
              if(this.serviceSelected.name === this.serviceForm.controls['name'].value && this.serviceSelected.description === this.serviceForm.controls['description'].value){
                this.formsEquals = true;
              }
              else{
                this.formsEquals = false;
              }
            })
  }
  getFieldValid(field : string){
    return this.serviceForm.get(field).invalid &&
            this.serviceForm.get(field).touched
  }
}
