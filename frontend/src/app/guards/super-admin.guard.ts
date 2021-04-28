import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminGuard implements CanActivate {
  user: User;
  constructor(private userService: UserService,
              private router: Router){
              }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot){
      return this.userService.validateToken()
            .pipe(tap( isauthenticated => {
                if (!isauthenticated){
                  this.router.navigateByUrl('/admin/login');
                }
                this.user = this.userService.user;
                if (this.user.role !== 'SUPER-ADMIN'){
                  if(this.user.role === 'USER'){
                    this.router.navigateByUrl('/home');
                  }
                  else if(this.user.role === 'CENTER-SUPER-ADMIN' || this.user.role === 'CENTER-ADMIN'){
                    this.router.navigateByUrl('/admin');
                  }
                }
            }));
  }
  
}
