import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { ErrorsService } from 'src/app/services/errors.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  ngOnInit(): void {
  }
  loginForm: FormGroup;
  passwordIsVisible: boolean;
  hiddenEmailModal: boolean = false;
  constructor(private fb: FormBuilder,
              private userService: UserService,
              private router: Router,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) {
    this.createForm();

  }

  createForm(){
    this.loginForm = this.fb.group({
      // email: [localStorage.getItem('email') || '', [Validators.required, Validators.email]],
      email: [ 'sol.salin@gmail.com', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [true, , ]
    });
  }



  login(){
    if (this.loginForm.invalid){
      Object.values(this.loginForm.controls).forEach(control=>{
        control.markAsTouched();
      })
      return;
    }
    this.userService.signIn(this.loginForm.value, 'USER')
                      .subscribe(resp => {
                        if (this.loginForm.get('remember').value){
                          localStorage.setItem('email', this.loginForm.get('email').value);
                        }else{
                          localStorage.removeItem('email');
                        }
                        this.sweetAlertService.showSwalResponse({
                          title:'Ingresando',
                          text:'',
                          icon:'success'
                        });
                        setTimeout(() => {
                          this.router.navigateByUrl('');
                        }, 2000);
                      }, (err) => {
                        console.log(err);
                        console.log('hola')
                        this.errorService.showErrors('MEJORAR ERRORES',99)
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
