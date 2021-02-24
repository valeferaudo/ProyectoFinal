import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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

  userForm: FormGroup;
  pass = false;
  change = false;
  user: User;

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private validator: ValidatorService,
              private route: Router,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) {
                this.user = this.userService.user;
                this.createForm();
  }
  createForm(){
    this.userForm = this.fb.group({
      name: [{value: this.user.name, disabled: true}, [Validators.required]],
      address: [{value: this.user.address, disabled: true}, [Validators.required]],
      phone: [{value: this.user.phone, disabled: true}, [Validators.required]],
      email: [{value: this.user.email, disabled: true}, [Validators.required, Validators.email]],
      password: [, ],
      password2: [, []]
    }, {validators: this.validator.passEqual('password', 'password2')});
  }
  get pass2Valid(){
    const pass1 = this.userForm.get('password').value;
    const pass2 = this.userForm.get('password2').value;
    return ( pass1 === pass2 ) ? false : true;
 }
  saveChanges(){
    if (this.userForm.invalid){
      Object.values(this.userForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.userService.updateUser(this.user.uid, this.userForm.value)
                      .subscribe(resp => {
                        this.sweetAlertService.showSwalResponse({
                          title: 'Usuario Editado',
                          text:'',
                          icon: 'success',
                        })
                        setTimeout(() => {
                          window.location.reload();
                        }, 1500);
                      }, (err) => {
                        this.errorService.showErrors('nada',99)
                      });
  }
  getFieldValid(field: string){
    return this.userForm.get(field).invalid &&
            this.userForm.get(field).touched;
 }

  cancel(){
    this.pass = false;
    this.change = false;
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

}
