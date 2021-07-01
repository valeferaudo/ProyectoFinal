import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { SportCenter } from 'src/app/models/sportCenter.model';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SportCenterService } from 'src/app/services/sport-center.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-sport-center',
  templateUrl: './sport-center.component.html',
  styleUrls: ['./sport-center.component.css']
})
export class SportCenterComponent implements OnInit {

  userLogged: User;
  editMode: boolean = false;
  sportCenterForm: FormGroup;
  sportCenter: SportCenter;
  slideElectricity: boolean = false;
  slideMercadoPago:boolean = false;
  slidePaymentRequired:boolean = false;
  hiddenScheduleModal: boolean = false;
  images: File [] = [];
  hiddenServiceModal: boolean = false;
  hiddenSpecialScheduleInfoModal: boolean = false;
  hiddenSpecialScheduleCreateModal: boolean = false;
  accessTokenIsVisible: boolean;
  publicKeyIsVisible: boolean;

  //Mapa
  zoom: number = 15;
  mapTypeId: string = 'roadmap'
  constructor(private userService: UserService,
              private fb: FormBuilder,
              private router: Router,
              private sweetAlertService: SweetAlertService,
              private sportCenterService: SportCenterService,
              private errorService: ErrorsService,
              private loaderService: LoaderService,
              private uploadFileService: UploadFileService) { }

  ngOnInit(): void {
    this.userLogged = this.userService.user;
    this.sportCenter = this.userLogged.sportCenter;
    // this.getSportCenter();
    this.createForm();
    this.setSlide();
  }
  getSportCenter(){
    this.sportCenterService.getSportCenter(this.userLogged.sportCenter.id)
                .subscribe((resp:any) => {
                  if(resp.ok){
                    this.sportCenter=resp.param.sportCenter
                  }
                }, (err) => {
                  console.log(err)
                  this.errorService.showErrors('nada',99)
                });
  }
  createForm(){
    this.sportCenterForm = this.fb.group({
      name: [{value: this.sportCenter.name, disabled: true}, [Validators.required]],
      address: [{value: this.sportCenter.address, disabled: true},[Validators.required]],
      latitude: [{value: this.sportCenter.coords.latitude, disabled: true},[Validators.required]],
      longitude: [{value: this.sportCenter.coords.longitude, disabled: true},[Validators.required]],
      phone: [{value: this.sportCenter.phone, disabled: true}, [Validators.required]],
      aditionalElectricity:[{value: this.sportCenter.aditionalElectricity, disabled: true}],
      aditionalElectricityHour: [{value: this.sportCenter.aditionalElectricityHour, disabled: true}],
      mercadoPago: [{value: this.sportCenter.mercadoPago, disabled: true}, [Validators.required]],
      paymentRequired: [{value: this.sportCenter.paymentRequired, disabled: true}, ],
      minimunAmount: [{value: this.sportCenter.minimunAmount, disabled: true},],
      accessToken: [{value: this.sportCenter.credentials.accessToken, disabled: true}],
      publicKey: [{value: this.sportCenter.credentials.publicKey, disabled: true}]
    });
  }
  setSlide(){
      if(this.sportCenter.aditionalElectricity === null){
        this.slideElectricity = false;
      }
      else{
        this.slideElectricity = true;
      }
      this.sportCenter.mercadoPago === true ? this.slideMercadoPago = true : this.slideMercadoPago = false;
      this.sportCenter.paymentRequired === true ? this.slidePaymentRequired = true : this.slidePaymentRequired = false;

  }
  getFieldValid(field: string){
      return this.sportCenterForm.get(field).invalid &&
              this.sportCenterForm.get(field).touched;
  }
  unlockForm(){
    this.editMode= true;
    Object.values(this.sportCenterForm.controls).forEach(control=>{
      control.enable();
    })
  }
  cancel(){
      this.fillForm();
      this.setSlide();
      this.editMode = false;
      this.disableForm();
  }
  fillForm(){
      this.sportCenterForm.patchValue({
        name: this.sportCenter.name,
        address: this.sportCenter.address,
        latitude: this.sportCenter.coords.latitude,
        longitude: this.sportCenter.coords.longitude,
        phone: this.sportCenter.phone,
        aditionalElectricity: this.sportCenter.aditionalElectricity,
        aditionalElectricityHour: this.sportCenter.aditionalElectricityHour,
        mercadoPago: this.sportCenter.mercadoPago,
        paymentRequired: this.sportCenter.paymentRequired,
        minimunAmount: this.sportCenter.minimunAmount,
        accessToken: this.sportCenter.credentials.accessToken,
        publicKey: this.sportCenter.credentials.publicKey
      })
  }
  disableForm(){
    this.publicKeyIsVisible = false;
    this.accessTokenIsVisible = false;
      Object.values(this.sportCenterForm.controls).forEach(control => {
        control.disable(); });
  }
  goBack(){
      if(this.userLogged.role === 'CENTER-ADMIN'){
        this.router.navigateByUrl('admin/home');
      }
      else if(this.userLogged.role === 'CENTER-SUPER-ADMIN'){
        this.router.navigateByUrl('admin/users');
      }
  }
  updateSportCenter(){
      if (this.sportCenterForm.invalid){
        Object.values(this.sportCenterForm.controls).forEach(control => {
          control.markAsTouched();
        });
        return;
      }
      this.sweetAlertService.showSwalConfirmation({
        title: '¿Editar centro deportivo?',
        text: ``,
        icon: 'question',
      })
      .then((result) => {
        if (result.value) {
          this.loaderService.openLineLoader();
        this.sportCenterService.updateSportCenter(this.sportCenter.id, this.sportCenterForm.value)
                          .subscribe((resp: any) => {
                            if(resp.ok){
                              if(this.images.length > 0){
                                this.updateImages(this.sportCenter.id);
                              }
                              else{
                                this.sweetAlertService.showSwalResponse({
                                  title: 'Centro deportivo editado',
                                  text:'(Sin imágenes)',
                                  icon: 'success',
                                })
                              }
                              this.sportCenter = resp.param.sportCenter;
                              this.fillForm();
                              this.editMode = false;
                              this.sportCenterForm.disable();
                              this.publicKeyIsVisible = false;
                              this.accessTokenIsVisible = false;
                              this.loaderService.closeLineLoader();
                            }
                          }, (err) => {
                            console.log(err)
                            this.loaderService.closeLineLoader();
                            this.errorService.showErrors('nada',99)
                          });
        }
      })
  }
  electricitySlideChange(event: MatSlideToggle){
      this.slideElectricity = event.checked;
      if(this.slideElectricity === false){
        this.sportCenterForm.controls['aditionalElectricity'].reset();
        this.sportCenterForm.controls['aditionalElectricityHour'].reset();
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
  updateSchedule(){
    this.hiddenScheduleModal = true;
  }
  closeScheduleModal(){
    this.hiddenScheduleModal = false;
  }
  updateImages(sportCenterID){
    this.loaderService.openLineLoader();
    this.uploadFileService.uploadImage(this.images,'sportCenter',sportCenterID)
                    .then((resp: any) =>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.sweetAlertService.showSwalResponse({
                          title: 'Centro deportivo editado',
                          text:'(Con imágenes)',
                          icon: 'success'
                        })
                        resp.param.uploadImages.forEach(element => {
                          this.sportCenter.images.push(element)
                        });
                      }
                    },(err)=>{
                      console.log(err);
                      //PONER QUE EL ERROR ES EN LA SUBA DE IMÁGENES PERO QUE LA CANCHA SE EDITO O CREÓ //ponerlo en el servicio de upñload
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(99,'nada');
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
        this.uploadFileService.deleteImage(image, this.sportCenter.id, 'sportCenter')
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
                      this.errorService.showErrors(99,'nada');
                    })
      }
    })
  }
  deleteArrayImage(imageDeleted){
    this.sportCenter.images = this.sportCenter.images.filter(image => image !== imageDeleted)
  }
  openServiceModal(){
    this.hiddenServiceModal = true;
  }
  closeServiceModal(){
    this.hiddenServiceModal = false;
  }
  openSpecialScheduleInfoModal(){
    this.hiddenSpecialScheduleInfoModal = true;
  }
  closeSpecialScheduleInfoModal(){
    this.hiddenSpecialScheduleInfoModal = false;
  }
  openSpecialScheduleCreateModal(){
    this.hiddenSpecialScheduleCreateModal = true;
  }
  closeSpecialScheduleCreateModal(){
    this.hiddenSpecialScheduleCreateModal = false;
    this.hiddenSpecialScheduleInfoModal = true;
  }
  changeLocation(event){
    this.sportCenterForm.patchValue({
      latitude: event.coords.lat,
      longitude: event.coords.lng
    })
  }
  showAccessToken(){
    this.accessTokenIsVisible = !this.accessTokenIsVisible;
  }
  showPublicKey(){
    this.publicKeyIsVisible = !this.publicKeyIsVisible;
  }
}
