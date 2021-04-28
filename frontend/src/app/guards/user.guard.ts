import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {

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
            this.router.navigateByUrl('/login');
          }
          this.user = this.userService.user;
          if (this.user.role !== 'USER'){
            if(this.user.role === 'CENTER-ADMIN' || this.user.role === 'CENTER-SUPER-ADMIN'){
              this.router.navigateByUrl('/admin');
            }
            else if(this.user.role === 'SUPER-ADMIN'){
              this.router.navigateByUrl('/admin/super/users');
            }
            }
      }));
  }
}
