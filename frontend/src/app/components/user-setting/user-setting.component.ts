import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';
import { ValidatorService } from 'src/app/services/validator.service';

@Component({
  selector: 'app-user-setting',
  templateUrl: './user-setting.component.html',
  styleUrls: ['./user-setting.component.css']
})
export class UserSettingComponent implements OnInit {

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
              private router: Router,
              private loaderService: LoaderService,
              private activatedRoute: ActivatedRoute,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) {}
  
  ngOnInit(){
    this.getUser();
    this.createForm();
    this.disableForm();
  }
  getUser(){
      this.userID = this.activatedRoute.snapshot.params.id;
      this.userLogged = this.userService.user;
      if(this.userID !== this.userLogged.uid){
        this.router.navigateByUrl('/admin')
      }
  }
  createForm(){
    this.userForm = this.fb.group({
      name: [{value: this.userLogged.name, disabled: true}, [Validators.required]],
      lastName:[{value: this.userLogged.lastName, disabled: true}, [Validators.required]],
      address: [{value: this.userLogged.address, disabled: true},[]],
      phone: [{value: this.userLogged.phone, disabled: true}, [Validators.required]],
      email: [{value: this.userLogged.email, disabled: true}, [Validators.required, Validators.email]],
    });
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
        this.loaderService.openLineLoader();
        this.userService.updateUser(this.userLogged.uid, this.createUpdateObject())
                        .subscribe((resp: any) => {
                          this.loaderService.closeLineLoader();
                          if(resp.ok){
                            this.sweetAlertService.showSwalResponse({
                              title: 'Usuario Editado',
                              text:'',
                              icon: 'success',
                            })
                            this.userLogged = resp.param.user;
                            this.editMode = false;
                            this.userForm.disable();
                          }
                        }, (err) => {
                          console.log(err);
                          this.loaderService.closeLineLoader();
                          this.errorService.showErrors('nada',99)
                        });
      }
    })
  }
  createUpdateObject(){
    var userUpdated = {
      name: this.userForm.controls['name'].value,
      lastName: this.userForm.controls['lastName'].value,
      email: this.userLogged.email,
      phone: this.userForm.controls['phone'].value,
      address: this.userForm.controls['address'].value,
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
    this.fillForm();
    this.disableForm();
  }
  disableForm(){
    Object.values(this.userForm.controls).forEach(control => {
      control.disable(); });
  }
  unlockForm(){
    this.editMode= true
    Object.values(this.userForm.controls).forEach(control=>{
      control.enable();
    })
  }
  openChangePasswordModal(){
    this.hiddenPasswordModal=true;
  }
  closeChangePasswordModal(closeModal){
    this.hiddenPasswordModal = closeModal;
  }
  fillForm(){
    this.userForm.patchValue({
      name: this.userLogged.name,
      lastName: this.userLogged.lastName,
      phone: this.userLogged.phone,
      address: this.userLogged.address
    })
  }
  goBack(){
    if(this.userLogged.role === 'USER'){
      this.router.navigateByUrl('/user/home');
    }
    else if(this.userLogged.role === 'CENTER-ADMIN'){
      this.router.navigateByUrl('admin/home');
    }
    else if(this.userLogged.role === 'CENTER-SUPER-ADMIN'){
      this.router.navigateByUrl('admin/users');
    }
  }
}
