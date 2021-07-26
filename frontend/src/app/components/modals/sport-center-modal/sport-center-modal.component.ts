import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
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
  accessTokenIsVisible: boolean;
  publicKeyIsVisible: boolean;
  slideElectricity:boolean = false;
  slideMercadoPago: boolean = false;
  slidePaymentRequired:boolean = false;

  //Mapa
  zoom: number = 13;
  initialLat: number = -32.9611202;
  initialLng: number = -60.6847972;
  mapTypeId: string = 'roadmap'
  isMarked: boolean = false;

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private sportCenterService: SportCenterService,
              private errorService: ErrorsService,
              private loaderService: LoaderService,
              private router: Router,
              private sweetAlertService: SweetAlertService) {
                this.closeModalOutput = new EventEmitter(); 
                this.createSportCenterForm()
   }

  ngOnInit(): void {
  }

  createSportCenterForm(){
    this.sportCenterForm = this.fb.group({
      name:['',[Validators.required],],
      address:['',[Validators.required],],
      latitude: ['',[Validators.required]],
      longitude: ['',[Validators.required]],
      phone:['',[Validators.required],],
      aditionalElectricityHour:[null,],
      aditionalElectricity:[null,],
      mercadoPago:[false,[Validators.required],],
      paymentRequired: [''],
      minimunAmount: [null,[Validators.min(0),Validators.max(100)]],
      accessToken: [null],
      publicKey: [null]
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
        this.hiddenSportCenterModal= false;
        this.closeModalOutput.emit(this.hiddenSportCenterModal)
        this.userService.logOut();
      }
    })
  }
  createSportCenter(){
    if (this.sportCenterForm.invalid){
      this.markAsTouched();
      return;
    }
    if(this.slideElectricity === true){
      if( this.sportCenterForm.controls['aditionalElectricity'].value === null){
        this.sportCenterForm.controls['aditionalElectricity'].setErrors({'incorrect': true});
        this.markAsTouched();
        return;
      }
      else{
        this.sportCenterForm.controls['aditionalElectricity'].setErrors(null);
      }
      if(this.sportCenterForm.controls['aditionalElectricityHour'].value === null){
        this.sportCenterForm.controls['aditionalElectricityHour'].setErrors({'incorrect': true});
        this.markAsTouched();
        return;
      }
      else{
        this.sportCenterForm.controls['aditionalElectricityHour'].setErrors(null);
      }
    }
    if(this.slideMercadoPago === true){
      if( this.sportCenterForm.controls['accessToken'].value === null){
        this.sportCenterForm.controls['accessToken'].setErrors({'incorrect': true});
        this.markAsTouched();
        return;
      }
      else{
        this.sportCenterForm.controls['accessToken'].setErrors(null);
      }
      if(this.sportCenterForm.controls['publicKey'].value === null){
        this.sportCenterForm.controls['publicKey'].setErrors({'incorrect': true});
        this.markAsTouched();
        return;
      }
      else{
        this.sportCenterForm.controls['publicKey'].setErrors(null);
      }
    }
    if(this.slidePaymentRequired === true){
      if( this.sportCenterForm.controls['minimunAmount'].value === null){
        this.sportCenterForm.controls['minimunAmount'].setErrors({'incorrect': true});
        this.markAsTouched();
        return;
      }
      else{
        this.sportCenterForm.controls['minimunAmount'].setErrors(null);
      }
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
                            this.router.navigateByUrl('/admin');
                            this.hiddenSportCenterModal= false;
                            this.closeModalOutput.emit(this.hiddenSportCenterModal)
                        }, (err) => {
                          console.log(err)
                          this.errorService.showErrors(err.error.code,err.error.msg);
                          this.loaderService.closeLineLoader();
                        })
      }
    })
  }
  markAsTouched(){
    Object.values(this.sportCenterForm.controls).forEach(control=>{
      control.markAsTouched();
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
        this.sportCenterForm.controls['aditionalElectricityHour'].reset();
      }
      else{
        this.sportCenterForm.controls['aditionalElectricity'].setErrors(null);
        this.sportCenterForm.controls['aditionalElectricityHour'].setErrors(null);
      }
  }
  mercadoPagoSlideChange(event: MatSlideToggle){
    this.sportCenterForm.patchValue({
      mercadoPago: event.checked
    });
    this.slideMercadoPago = event.checked;
    if(this.slideMercadoPago === false){
      this.sportCenterForm.controls['accessToken'].reset();
      this.sportCenterForm.controls['publicKey'].reset();
    }
  }
  paymentRequiredSlideChange(event: MatSlideToggle){
    this.sportCenterForm.patchValue({
      paymentRequired: event.checked
    });
    this.slidePaymentRequired = event.checked;
    if(this.slidePaymentRequired === false){
      this.sportCenterForm.controls['minimunAmount'].reset();
    }
  }
  changeLocation(event){
    this.sportCenterForm.patchValue({
      latitude: event.coords.lat,
      longitude: event.coords.lng
    })
    this.isMarked = true;
  }
  showAccessToken(){
    this.accessTokenIsVisible = !this.accessTokenIsVisible;
  }
  showPublicKey(){
    this.publicKeyIsVisible = !this.publicKeyIsVisible;
  }
}
