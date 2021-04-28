import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SportCenterService } from 'src/app/services/sport-center.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-sport-center-modal',
  templateUrl: './sport-center-modal.component.html',
  styleUrls: ['./sport-center-modal.component.css']
})
export class SportCenterModalComponent implements OnInit {

  @Input() hiddenSportCenterModal: boolean;
  sportCenterForm: FormGroup;
  @Output() closeModalOutput: EventEmitter<boolean>;
  slideElectricity;
  slideMercadoPago;

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private sportCenterService: SportCenterService,
              private errorService: ErrorsService,
              private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService) {
                this.closeModalOutput = new EventEmitter(); 
                this.createSportCenterForm()
   }

  ngOnInit(): void {
  }

  createSportCenterForm(){
    this.sportCenterForm = this.fb.group({
      name:["",[Validators.required],],
      address:["",[Validators.required],],
      phone:["",[Validators.required],],
      aditionalElectricityHour:['20:00',[Validators.required],],
      aditionalElectricity:[,[Validators.required],],
      mercadoPago:[false,[Validators.required],]
    })
  }

  closeModal(){
    this.sweetAlertService.showSwalConfirmation({
      title:'¿Cancelar?',
      icon:'question',
      text:'Debe completar la siguiente información para poder continuar.'
    })
    .then((result) => {
      if (result.value) {
        this.sweetAlertService.showSwalResponse({
          title:'Redirigiendo',
          icon:'info',
          text:''
        });
        setTimeout(() => {
          this.hiddenSportCenterModal= false;
          this.closeModalOutput.emit(this.hiddenSportCenterModal)
          this.userService.logOut();
        }, 1500);
      }
    })
  }
  createSportCenter(){
    if (this.sportCenterForm.invalid){
      Object.values(this.sportCenterForm.controls).forEach(control=>{
        control.markAsTouched();
      })
      return;
    }
    this.sweetAlertService.showSwalConfirmation({
      title:'¿Crear centro deportivo?',
      icon:'question',
      text:''
    })
    .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.sportCenterService.createSportCenter(this.sportCenterForm.value)
                        .subscribe((resp: any) => {
                             this.loaderService.closeLineLoader();
                             this.sweetAlertService.showSwalResponse({
                               title: 'Centro deportivo creado',
                               text:'¡Bienvenido!',
                               icon: "success"
                             })
                             setTimeout(() => {
                              this.hiddenSportCenterModal= false;
                              this.closeModalOutput.emit(this.hiddenSportCenterModal)
                              console.log(this.userService.user)
                            }, 1500);
                        }, (err) => {
                          console.log(err)
                          this.errorService.showServerError()
                          this.loaderService.closeLineLoader();
                        })
      }
    })
  }
  getFieldValid(field : string){
    return this.sportCenterForm.get(field).invalid &&
            this.sportCenterForm.get(field).touched
 }
 electricitySlideChange(event: MatSlideToggle){
   this.slideElectricity = event.checked;
   if(this.slideElectricity === false){
     this.sportCenterForm.controls['aditionalElectricity'].reset();
   }
 }
 mercadoPagoSlideChange(event: MatSlideToggle){
  this.sportCenterForm.patchValue({
    mercadoPago: event.checked
  });
  this.slideMercadoPago = event.checked;
}
}
