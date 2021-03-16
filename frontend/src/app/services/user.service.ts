import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { tap, map, catchError} from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { LoginForm } from '../interfaces/loginForm.interface';
import { RegisterForm } from '../interfaces/registerForm.interface';
import { User } from '../models/user.model';
import { environment } from 'src/environments/environment';

const baseUrl = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public user: User;
  constructor(private http: HttpClient,
              private router: Router) {
  }
  signIn(dataForm: LoginForm, type: string ){
    const body = {
      email : dataForm.email,
      password: dataForm.password,
      type: type
    };
    return this.http.post(`${baseUrl}/login/`, body)
                    .pipe(tap((resp: any) => {
                        localStorage.setItem('token', resp.token);
                    }));
  }

  signUp(dataForm: User, role){
    dataForm.role = role;
    return this.http.post(`${baseUrl}/users`, dataForm);
  }

  validateToken(): Observable<boolean>{
    const token = localStorage.getItem('token') || '';
    return this.http.get(`${baseUrl}/login/renew`, {
                          headers: {
                            'x-token': token
                          }
                        })
              .pipe(tap((resp: any) => {
                        const{name,secondName, uid, email, role, phone, address} = resp.user;
                        this.user  = new User( name, secondName, address, phone, email, '', role, uid);
                        localStorage.setItem('token', resp.token);
            }), map(resp => {
                        return true;
            }), catchError(error => {
                        return of(false);
          })
      );
  }


  logOut(){
    localStorage.removeItem('token');
    if(this.user.role === 'USER'){
      this.router.navigateByUrl('home')
    }
    else{
      this.router.navigateByUrl('/admin/home')
    }
  }
  createUser(user){
    const token = localStorage.getItem('token') || '';
    return this.http.get(`${baseUrl}/users/` ,{ headers: {'x-token': token}});
  }
  deleteUser(userID){
    const token = localStorage.getItem('token') || '';
    return this.http.get(`${baseUrl}/users/` ,{ headers: {'x-token': token}});
  }
  getUserTypes(){
    const token = localStorage.getItem('token') || '';
    return this.http.get(`${baseUrl}/users/` ,{ headers: {'x-token': token}});
  }
  getUser(userID){
    const token = localStorage.getItem('token') || '';
    return this.http.get(`${baseUrl}/users/` ,{ headers: {'x-token': token}});
  }
  getUsers(){
    const token = localStorage.getItem('token') || '';
    return this.http.get(`${baseUrl}/users/` ,{ headers: {'x-token': token}});
  }
  updateUser(id: string, data){
    const token = localStorage.getItem('token') || '';
    return this.http.put(`${baseUrl}/users/${id}`, data, { headers: {'x-token': token}});
  }

  recoverPassword(email){
    return this.http.put(`${baseUrl}/users/RegeneratePassword`,email)
  }
  changePassword(newPasswords){
    const body = {
      OldPassword: newPasswords.oldPassword,
      NewPassword: newPasswords.password,
      RepeatNewPassword: newPasswords.password2
    }
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'x-token': token
    });
    return this.http.put(`${baseUrl}/users/password/${this.user.uid}`,body,{headers})
  }
}
