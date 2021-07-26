import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';
import { ValidatorService } from 'src/app/services/validator.service';

@Component({
  selector: 'app-admin-register',
  templateUrl: './admin-register.component.html',
  styleUrls: ['./admin-register.component.css']
})
export class AdminRegisterComponent {

  registerForm: FormGroup;

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private router: Router,
              private validator: ValidatorService,
              private loaderService: LoaderService,
              private errorService: ErrorsService,
              private sweetAlertService: SweetAlertService) {
    this.createForm();
   }

   createForm(){
     this.registerForm = this.fb.group({
       name: ['', [Validators.required]],
       lastName: ['', [Validators.required]],
       address: ['',[Validators.required] ],
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
     this.userService.signUp(this.registerForm.value, 'CENTER-SUPER-ADMIN')
                      .subscribe(resp => {
                        this.loaderService.closeLineLoader();
                        this.sweetAlertService.showSwalResponseDelay({
                          title: '¡Usuario registrado!',
                          text:'Por favor, espere que el administrador general apruebe su registro.',
                          icon: 'success',
                        })
                        setTimeout(() => {
                          this.router.navigateByUrl('/admin/login');
                        }, 2000);
                      }, (err) => {
                        console.log(err)
                        this.loaderService.closeLineLoader();
                        this.errorService.showErrors(err.error.code,err.error.msg)
                      });
   }

}
