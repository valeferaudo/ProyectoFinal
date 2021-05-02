import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Sport } from 'src/app/models/sport.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SportService } from 'src/app/services/sport.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-sport-modal',
  templateUrl: './sport-modal.component.html',
  styleUrls: ['./sport-modal.component.css']
})
export class SportModalComponent implements OnInit {
  @Input() hiddenModal: boolean;
  @Input() mode: 'create' | 'update';
  @Input() sportSelected: Sport;
  @Output() closeModal = new EventEmitter<string>();
  @Output() getSports = new EventEmitter<string>();

  sportForm: FormGroup
  sport: Sport;
  formsEquals: boolean = true;
  constructor(private sportService: SportService,
              private fb: FormBuilder,
              private errorService: ErrorsService,
              private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService) {}
    
  ngOnInit(): void {
    this.createSportForm();
    this.getMode();
  }
  getMode(){
    if(this.mode === 'update'){
      this.sportForm.patchValue({
        name: this.sportSelected.name,
        description: this.sportSelected.description
      })
      this.listenerForm();
    }
  }
  createSportForm(){
    this.sportForm = this.fb.group({
      name:["",[Validators.required],],
      description:["",[],]
    })
  }
  closedModal(){
    this.closeModal.emit()
  }
  createSport(){
    if (this.sportForm.invalid){
      Object.values(this.sportForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Crear deporte?',
      text: ``,
      icon: 'question'})
    .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.sportService.createSport(this.sportForm.value)
                    .subscribe((resp: any) =>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.sweetAlertService.showSwalResponse({
                          title: 'Deporte creado',
                          text:'',
                          icon: 'success'
                        })
                        this.getSports.emit();
                        this.closedModal();
                      }
                    },(err)=>{
                      console.log(err);
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(99,'nada');
                    })
      }
    })
  }
  updateSport(){
    if (this.sportForm.invalid){
      Object.values(this.sportForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Editar deporte?',
      text: ``,
      icon: 'question'})
    .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.sportService.updateSport(this.sportSelected.id,this.sportForm.value)
                    .subscribe((resp: any) =>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.sweetAlertService.showSwalResponse({
                          title: 'Deporte editado',
                          text:'',
                          icon: 'success'
                        })
                        this.getSports.emit();
                        this.closedModal();
                      }
                    },(err)=>{
                      console.log(err);
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(99,'nada');
                    })
      }
    })
  }
  listenerForm(){
    this.sportForm.valueChanges
            .subscribe(resp=>{
              if(this.sportSelected.name === this.sportForm.controls['name'].value && this.sportSelected.description === this.sportForm.controls['description'].value){
                this.formsEquals = true;
              }
              else{
                this.formsEquals = false;
              }
            })
  }
  getFieldValid(field : string){
    return this.sportForm.get(field).invalid &&
            this.sportForm.get(field).touched
  }
}
