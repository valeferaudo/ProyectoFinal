import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  userLogged: User;
  sportCenterID: string;
  constructor(private sweetAlertService: SweetAlertService,
    private userService: UserService,
    private router: Router) { 
      this.getUserLogged();
    }

  ngOnInit(): void {
  }
  getUserLogged(){
    this.userLogged = this. userService.user;
    this.sportCenterID = this.userLogged.sportCenter;
    console.log(this.sportCenterID)
  }
  logout(){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Desea cerrar sesión?',
      text:'',
      icon: 'question',
    })
    .then((result) => {
      if (result.value) {
        this.sweetAlertService.showSwalResponse({
          title: 'Cerrando sesión',
          text:'',
          icon: 'warning',
        })
        setTimeout(() => {
          this.userService.logOut();
        }, 2000);
        }

    });
  }
  goToUsers(){
    if(this.userLogged.role === 'CENTER-SUPER-ADMIN'){
      this.router.navigateByUrl('/admin/users');
    }
    else if (this.userLogged.role === 'SUPER-ADMIN'){
      this.router.navigateByUrl('/admin/super/users');
    }
  }
}
