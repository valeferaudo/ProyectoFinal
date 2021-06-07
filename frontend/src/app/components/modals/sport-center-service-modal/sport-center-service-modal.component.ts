import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Combo } from 'src/app/interfaces/combo.interface';
import { Field } from 'src/app/models/field.model';
import { SportCenter } from 'src/app/models/sportCenter.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { FieldService } from 'src/app/services/field.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ServiceService } from 'src/app/services/service.service';
import { SportCenterService } from 'src/app/services/sport-center.service';
import { SportService } from 'src/app/services/sport.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-sport-center-service-modal',
  templateUrl: './sport-center-service-modal.component.html',
  styleUrls: ['./sport-center-service-modal.component.css']
})
export class SportCenterServiceModalComponent implements OnInit {

  @Input() hiddenModal: boolean;
  @Input() sportCenter: SportCenter;
  @Output() closeModal = new EventEmitter<string>();
  @Output() getSportCenter = new EventEmitter<string>();

  serviceCombo: Combo [] = [];
  sportCenterServiceForm: FormGroup;

  constructor(private fb: FormBuilder,
              private sportCenterService: SportCenterService,
              private serviceService: ServiceService,
              private loaderService: LoaderService,
              private errorService: ErrorsService,
              private sweetAlertService: SweetAlertService) { }

  get service(){
    return this.sportCenterServiceForm.get('service') as FormArray;
  }

  ngOnInit(): void {
    this.getServiceCombo();
    this.createSportCenterServiceForm();
    this.fillForm();
  }
  getServiceCombo(){
    this.serviceService.getServiceCombo()
                      .subscribe((resp: any) => {
                        if(resp.ok){
                          this.serviceCombo = resp.param.combo
                        }
                      },(err)=>{
                        console.log(err);
                        this.errorService.showErrors(99,'nada');
                      })
  }
  fillForm(){
    let i = 0;
    this.sportCenter.services.forEach(fs => {
      this.addSportCenterService();
      this.service.controls[i].patchValue({
        service: fs.service,
        description: fs.description
      })
      i++
    });
  }
  createSportCenterServiceForm(){
    this.sportCenterServiceForm = this.fb.group({
      service: this.fb.array([])
    })
  }
  addSportCenterService(){
    this.service.push(this.addSportCenterServiceGroup())
  }
  addSportCenterServiceGroup(){
    return this.fb.group({
      service: [,[Validators.required],],
      description: ['',[Validators.required],],
    });
  }
  deleteSportCenterService(index){
    this.service.removeAt(index);
  }
  updateSportCenterService(){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Modificar Centro Deportivo?',
      text: ``,
      icon: 'question'})
    .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.sportCenterService.updateServices(this.sportCenter.id,this.sportCenterServiceForm.value)
                  .subscribe((resp: any) =>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.sweetAlertService.showSwalResponse({
                          title: 'Centro Deportivo editado',
                          text:'',
                          icon: 'success'
                        })
                        this.closedModal();
                        this.getSportCenter.emit();
                      }
                    },(err)=>{
                      console.log(err);
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(99,'nada');
                    })
      }
    })
  }
  closedModal(){
    this.closeModal.emit();
  }
  getFieldValid(field : string){
    return this.sportCenterServiceForm.get(field).invalid &&
            this.sportCenterServiceForm.get(field).touched
  }

}
