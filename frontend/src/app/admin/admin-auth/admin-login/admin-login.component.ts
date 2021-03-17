import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorsService } from 'src/app/services/errors.service';
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

  constructor(private router: Router,
              private fb: FormBuilder,
              private userService: UserService,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) {
    this.createLoginForm();
   }

   ngOnInit(): void {
   }

  createLoginForm(){
    this.loginForm = this.fb.group({
      email: [localStorage.getItem('email') || '', [Validators.required, Validators.email]],
      password: ['', Validators.required],
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
     this.userService.signIn(this.loginForm.value, 'CENTER')
                      .subscribe(resp => {
                        console.log(resp)
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
                        this.router.navigateByUrl('/admin/home');
                        setTimeout(() => {
                        }, 2000);
                      }, (err) => {
                        console.log(err);
                        this.errorService.showErrors('mejorar',99)
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
}
