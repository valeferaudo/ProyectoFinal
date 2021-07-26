import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';
import { ValidatorService } from 'src/app/services/validator.service';

@Component({
  selector: 'app-user-modal',
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.css']
})
export class UserModalComponent implements OnInit {

  @Input() hiddenModal: boolean;
  @Output() closeModal = new EventEmitter<string>();
  @Output() getUsers = new EventEmitter<string>();

  userForm: FormGroup;
  userLogged: User;
  constructor(private fb: FormBuilder,
              private userService: UserService,
              private errorService: ErrorsService,
              private sweetAlertService: SweetAlertService,
              private loaderService: LoaderService,
              private validator: ValidatorService) { }

  ngOnInit(): void {
    this.userLogged = this.userService.user;
    this.createUserForm();
  }
  createUserForm(){
    this.userForm = this.fb.group({
      name: ["", [Validators.required]],
      lastName:["", [Validators.required]],
      address: ["",],
      phone: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      password: [, ],
      password2: [, []]
    }, {validators: this.validator.passEqual('password', 'password2')});
  }
  closedModal(){
    this.closeModal.emit();
  }
  getFieldValid(field : string){
    return this.userForm.get(field).invalid &&
            this.userForm.get(field).touched
  }
  createUser(){
    if (this.userForm.invalid){
      Object.values(this.userForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Crear usuario?',
      text: ``,
      icon: 'question',
    })
    .then((result) => {
      if (result.value) {
      this.loaderService.openLineLoader();
      this.userService.signUp(this.fillUserObject(),'CENTER-ADMIN')
                        .subscribe((resp: any) => {
                          if(resp.ok){
                            this.loaderService.closeLineLoader();
                            this.sweetAlertService.showSwalResponse({
                              title: 'Usuario creado',
                              text:'',
                              icon: 'success',
                            })
                            this.closeModal.emit();
                            this.getUsers.emit();
                          }
                        }, (err) => {
                          console.log(err);
                          this.loaderService.closeLineLoader();
                          this.errorService.showErrors(err.error.code,err.error.msg);
                        });
      }
    })
  }
  fillUserObject(){
    let userObject;
    userObject = {
      name: this.userForm.controls['name'].value,
      lastName: this.userForm.controls['lastName'].value,
      address: this.userForm.controls['address'].value,
      phone: this.userForm.controls['phone'].value,
      email: this.userForm.controls['email'].value,
      password: this.userForm.controls['password'].value,
      sportCenter: this.userLogged.sportCenter.id,
    }
    return userObject;
  }
}
