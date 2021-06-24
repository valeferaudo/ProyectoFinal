import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { tap, map, catchError} from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { LoginForm } from '../interfaces/loginForm.interface';
import { RegisterForm } from '../interfaces/registerForm.interface';
import { User } from '../models/user.model';
import { environment } from 'src/environments/environment.prod';
import { UserFilter } from '../interfaces/filters/userFilter.interface';

const baseUrl = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  registerPerPage = '6';
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
                      this.user = resp.user
                      localStorage.setItem('x-token', resp.token);
                    }));
  }
  signUp(dataForm: User, role){
    dataForm.role = role;
    return this.http.post(`${baseUrl}/users`, dataForm);
  }
  validateToken(): Observable<boolean>{
    return this.http.get(`${baseUrl}/login/renew`)
              .pipe(map((resp: any) => {
                        const{name,lastName, uid, email, role, phone, address, favorites, sportCenter} = resp.user;
                        this.user  = new User( name, lastName, address, phone, email, '', role, uid, favorites,sportCenter);
                        localStorage.setItem('token', resp.token);
                        return true;
            }), catchError(error => {
                        return of(false);
          })
      );
  }
  logOut(){
    if(this.user.role === 'USER'){
      this.router.navigateByUrl('/login')
    }
    else{
      this.router.navigateByUrl('/admin/login')
    }
    localStorage.removeItem('x-token');
  }
  deleteUser(userID){
    return this.http.get(`${baseUrl}/users/`);
  }
  getUserTypes(){
    return this.http.get(`${baseUrl}/users/`);
  }
  getUser(userID){
    return this.http.get(`${baseUrl}/users/`);
  }
  getUsers(filters: UserFilter, page){
    let params = new HttpParams();
    params = params.append('text',filters.text);
    params = params.append('state',filters.state);
    params = params.append('userType', filters.userType);
    params = params.append('page',`${page}`);
    params = params.append('registerPerPage',this.registerPerPage);
    return this.http.get(`${baseUrl}/users/` ,{params});
  }
  updateUser(id: string, data){
    return this.http.put(`${baseUrl}/users/${id}`, data);
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
    return this.http.put(`${baseUrl}/users/password/${this.user.uid}`,body)
  }
  acceptBlockUser(id, action){
    let body = {
      action: action
    };
    return this.http.put(`${baseUrl}/users/acceptBlock/${id}`,body);
  }
  changeRole(id){
    return this.http.put(`${baseUrl}/users/changeRole/${id}`,{});
  }
  addRemoveFavorite(id){
    return this.http.put(`${baseUrl}/favorites/${id}`,{});
  }
  getFavorites(type: 'field' | 'sportCenter',page){
    let params = new HttpParams();
    params = params.append('type',`${type}`);
    params = params.append('page',`${page}`);
    params = params.append('registerPerPage',this.registerPerPage);
    return this.http.get(`${baseUrl}/favorites`,{params});
  }
  getLocation(){
    return this.http.post(`https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyD3VgKPKtNrPpr-86YZT-s7SFLJtHSHyU4`,{})
  }
}
