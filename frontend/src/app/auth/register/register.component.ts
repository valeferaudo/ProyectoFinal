import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';
import { ValidatorService } from 'src/app/services/validator.service'

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerForm: FormGroup;

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private router: Router,
              private validator: ValidatorService,
              private errorService: ErrorsService,
              private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService) {
    this.createForm();
   }

   createForm(){
     this.registerForm = this.fb.group({
       name: ['', [Validators.required]],
       lastName: ['', [Validators.required]],
       address: ['', ],
       phone: ['', [Validators.required]],
       email: ['', [Validators.required, Validators.email]],
       password: ['', [Validators.required]],
       password2: ['', [Validators.required]]
     }, {validators: this.validator.passEqual('password', 'password2')});
   }
   getFieldValid(field: string){
      return this.registerForm.get(field).invalid &&
              this.registerForm.get(field).touched;
   }

   signUp(){
     if (this.registerForm.invalid){
       Object.values(this.registerForm.controls).forEach(control => {
         control.markAsTouched();
       });
       return;
     }
     this.loaderService.openLineLoader();
     this.userService.signUp(this.registerForm.value, 'USER')
                      .subscribe(resp => {
                        this.loaderService.closeLineLoader();
                        this.sweetAlertService.showSwalResponse({
                          title: 'Usuario Registrado',
                          text:'',
                          icon: 'success',
                        })
                        this.router.navigateByUrl('/login');
                      }, (err) => {
                        this.loaderService.closeLineLoader();
                        console.log(err)
                        this.errorService.showErrors('error',99)
                      });
   }

}
