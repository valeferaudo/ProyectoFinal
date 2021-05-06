import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-admin-navbar',
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.css']
})
export class AdminNavbarComponent implements OnInit {

  user : User;
  constructor( private userService: UserService,
              private router: Router ) {
     this.user = userService.user;
  }

  logout() {
    this.userService.logOut();
  }

  ngOnInit(): void {
  }
  goProfile(){
    this.router.navigateByUrl(`/user/${this.user.uid}`)
  }
  goHome(){
    if(this.user.role === 'SUPER-ADMIN'){
      this.router.navigateByUrl(`/admin/super/users`)

    }
    else if (this.user.role === 'CENTER-ADMIN' || this.user.role === 'CENTER-SUPER-ADMIN'){
      this.router.navigateByUrl(`/admin`)

    }
  }
}
