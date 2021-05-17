import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {

  userLogged: User;
  hiddenSportCenterModal: boolean = false;

  doNotCloseMenu = (event) => event.stopPropagation();

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.getUserLogged();
  }
  getUserLogged(){
    this.userLogged = this.userService.user;
    this.createSportCenter();
  }
  createSportCenter(){
    if(this.userLogged.role === 'CENTER-SUPER-ADMIN'){
      if(this.userLogged.sportCenter === undefined || this.userLogged.sportCenter === null){
        this.hiddenSportCenterModal=true;
      }
    }
  }
  closeSportCenterModal(closeModal){
    this.hiddenSportCenterModal = closeModal
  }
}
