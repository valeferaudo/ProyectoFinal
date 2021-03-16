import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';
import { ValidatorService } from 'src/app/services/validator.service';

@Component({
  selector: 'app-user-setting',
  templateUrl: './user-setting.component.html',
  styleUrls: ['./user-setting.component.css']
})
export class UserSettingComponent {

  //Banderas
  editMode: boolean = false;
  createMode: boolean = false;
  hiddenPasswordModal:boolean = false;

  userForm: FormGroup;
  pass = false;
  change = false;
  userLogged: User;
  userInParam: User;
  userID;

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private validator: ValidatorService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) {
                this.getUserLogged();
                this.getUser();
                this.createForm();
              }
  getUser(){
    if (this.router.url === '/admin/user'){
      this.createMode = true;
    }
    else{
      this.userID = this.activatedRoute.snapshot.params.id;
      if (this.userID !== this.userLogged.uid){
        if(this.userLogged.role !== 'CENTER-SUPER-ADMIN'){
          this.sweetAlertService.showSwalError({
            title:'Acceso Prohibido',
            icon:'error',
            text:''
          })
        }
      }
    }
  }
  getUserLogged(){
    //CUANDO REUTILICE ESTO EN LOS DEMAS USUARIOS ACA HAY Q VER LA RUTA, DESPUES SI HAY PARAMTTRO O NO (ID) 
    this.userLogged = this.userService.user;
  }
  createForm(){
    this.userForm = this.fb.group({
      name: [{value: this.userLogged.name, disabled: true}, [Validators.required]],
      secondName:[{value: this.userLogged.secondName, disabled: true}, [Validators.required]],
      address: [{value: this.userLogged.address, disabled: true},[]],
      phone: [{value: this.userLogged.phone, disabled: true}, [Validators.required]],
      email: [{value: this.userLogged.email, disabled: true}, [Validators.required, Validators.email]],
      password: [, ],
      password2: [, []]
    }, {validators: this.validator.passEqual('password', 'password2')});
  }

  updateUser(){
    if (this.userForm.invalid){
      Object.values(this.userForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Editar usuario?',
      text: ``,
      icon: 'question',
    })
    .then((result) => {
      if (result.value) {
      this.userService.updateUser(this.userLogged.uid, this.createUpdateObject())
                        .subscribe(resp => {
                          this.sweetAlertService.showSwalResponse({
                            title: 'Usuario Editado',
                            text:'',
                            icon: 'success',
                          })
                          this.editMode = false;
                          this.userForm.disable();
                        }, (err) => {
                          console.log(err)
                          this.errorService.showErrors('nada',99)
                        });
      }
    })
  }
  createUpdateObject(){
    if (this.userLogged.role === 'USER'){
      var userUpdated = {
        name: this.userForm.controls['name'].value,
        secondName: this.userForm.controls['secondName'].value,
        email: this.userLogged.email,
        phone: this.userForm.controls['phone'].value,
        address: this.userForm.controls['address'].value,
      }
    }
    return userUpdated;
  }
  getFieldValid(field: string){
    return this.userForm.get(field).invalid &&
            this.userForm.get(field).touched;
 }

  cancel(){
    this.pass = false;
    this.change = false;
    this.editMode = false;
    this.disableForm();
  }

  disableForm(){
    Object.values(this.userForm.controls).forEach(control => {
      control.disable(); });
    // this.userForm.controls['name'].disable();
  }
  cambiar(){
    this.change = !this.change;
    Object.values(this.userForm.controls).forEach(control => {
      control.enable();
    });
  }
  unlockForm(){
    this.editMode= true
    Object.values(this.userForm.controls).forEach(control=>{
      control.enable();
    })
  }
  deleteUser(){
    // if(this.userID === this.userLogged.id){
    //   this.sweetAlertService.showSwalConfirmation({
    //     title: '¿Desea dar de baja su cuenta?',
    //     text: ``,
    //     icon: 'question',
    //   })
    //   .then((result) => {
    //     if (result.value) {
    //       this.fullScreenLoaderService.openDataLoader();
    //       this.userService.deleteUser(this.userID)
    //                       .subscribe( (resp: any)=>{
    //                         if (resp.success === true){
    //                           this.fullScreenLoaderService.closeDataLoader();
    //                           this.sweetAlertService.showSwalResponse({
    //                             title: 'Cuenta dada de baja',
    //                             text:'Está siendo redirigido/a',
    //                             icon: "success",
    //                           })
    //                           setTimeout(() => {
    //                               this.userService.logout()
    //                          }, 1000);
    //                         }
    //                         else if(resp.success === false){
    //                           this.fullScreenLoaderService.closeDataLoader();
    //                           this.errorService.showErrors(resp.responseCode,resp.descriptionCode)
    //                         }
    //                       }, (err) => {
    //                         this.errorService.showServerError()
    //                         this.fullScreenLoaderService.closeDataLoader();
    //                       })
    //                 }
    //     }
    //   )
    // }
    // else if (this.userID !== this.userLogged.id){
    //   this.sweetAlertService.showSwalConfirmation({
    //     title: '¿Desea dar de baja la cuenta?',
    //     text: ``,
    //     icon: 'question',
    //   })
    //   .then((result) => {
    //     if (result.value) {
    //       this.userService.deleteUser(this.userID)
    //                       .subscribe( (resp: any)=>{
    //                         this.fullScreenLoaderService.close();
    //                         if (resp.success === true){
    //                           this.sweetAlertService.showSwalResponse({
    //                             title: 'Cuenta dada de baja',
    //                             text:'Está siendo redirigido/a',
    //                             icon: "success",
    //                           })
    //                           setTimeout(() => {
    //                             this.router.navigateByUrl("users")
    //                         }, 1000);
    //                         }
    //                         else if(resp.success === false){
    //                           this.errorService.showErrors(resp.responseCode,resp.descriptionCode)
    //                         }
    //                       }, (err) => {
    //                         this.errorService.showServerError()
    //                         this.fullScreenLoaderService.closeDataLoader();
    //                       })
    //                 }
    //   }
    // )
    // }
  }
  openChangePasswordModal(){
    this.hiddenPasswordModal=true;
  }
  closeChangePasswordModal(closeModal){
    this.hiddenPasswordModal = closeModal;
  }
  goBack(){
    if(this.userLogged.role === 'USER'){
      this.router.navigateByUrl('home');
    }
    else if(this.userLogged.role === 'CENTER-ADMIN'){
      this.router.navigateByUrl('admin/home');
    }
    else if(this.userLogged.role === 'CENTER-SUPER-ADMIN'){
      this.router.navigateByUrl('admin/users');
    }
  }
  createUser(){

  }
}
