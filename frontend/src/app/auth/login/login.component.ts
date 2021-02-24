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

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private router: Router,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) {
    this.createForm();

  }

  createForm(){
    this.loginForm = this.fb.group({
      email: [localStorage.getItem('email') || '', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [true, , ]
    });
  }



  signIn(){
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
                        this.errorService.showErrors('MEJORAR ERRORES',99)
                      });
  }
}
