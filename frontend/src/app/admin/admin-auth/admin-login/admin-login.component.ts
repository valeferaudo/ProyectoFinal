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
      remember: [false]
    });
  }
  login(){
     this.userService.signIn(this.loginForm.value, 'CENTER-ADMIN')
                      .subscribe(resp => {
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
                        setTimeout(() => {
                          this.router.navigateByUrl('/admin/home');
                        }, 2000);
                      }, (err) => {
                        console.log(err);
                        this.errorService.showErrors('mejorar',99)
                      });
  }

}
