import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit {

  loginForm: FormGroup;
  passwordIsVisible: boolean;
  hiddenEmailModal: boolean = false;
  hiddenSportCenterModal: boolean = false;

  constructor(private router: Router,
              private fb: FormBuilder,
              private userService: UserService,
              private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) {
    this.createLoginForm();
   }

   ngOnInit(): void {
   }

  createLoginForm(){
    this.loginForm = this.fb.group({
      email: [localStorage.getItem('email') || '', [Validators.required, Validators.email]],
      password: [, Validators.required],
      remember: [true]
    });
  }
  login(){
    if (this.loginForm.invalid){
      Object.values(this.loginForm.controls).forEach(control=>{
        control.markAsTouched();
      })
      return;
    }
    this.loaderService.openLineLoader();
     this.userService.signIn(this.loginForm.value, 'CENTER')
                      .subscribe(resp => {
                        this.loaderService.closeLineLoader();
                        if (this.loginForm.get('remember').value){
                          localStorage.setItem('email', this.loginForm.get('email').value);
                        }else{
                          localStorage.removeItem('email');
                        }
                        this.sweetAlertService.showSwalResponse({
                          title: 'Ingresando',
                          text:'',
                          icon: 'success',
                        })
                        if(resp.user.role === 'SUPER-ADMIN'){
                          this.router.navigateByUrl('/admin/super/users');
                        }
                        else{
                          if (resp.needSportCenter === true){
                              setTimeout(() => {
                                this.hiddenSportCenterModal = true;
                              }, 1000);
                          }
                          else if (resp.needSportCenter === false){
                            this.hiddenSportCenterModal = false;
                            this.router.navigateByUrl('/admin');
                          }
                        }
                      }, (err) => {
                        console.log(err);
                        this.loaderService.closeLineLoader();
                        this.errorService.showErrors(err.error.code,err.error.msg)
                      });
  }
  getFieldValid(field : string){
    return this.loginForm.get(field).invalid &&
            this.loginForm.get(field).touched
  }
  showPassword(){
    this.passwordIsVisible = !this.passwordIsVisible;
  }
  goRecoverPassword(){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Desea recuperar la contraseña?',
      text: ``,
      icon: 'question'})
    .then((result) => {
      if (result.value) {
                     setTimeout(() => {
                       this.hiddenEmailModal=true
                     }, 200);
                  }
      }
    )
  }
  
  closeRecoverPasswordModal(closeModal){
    this.hiddenEmailModal = closeModal
  }
  closeSportCenterModal(closeModal){
    this.hiddenSportCenterModal = false;
    this.loginForm.controls['password'].reset();
  }
}
