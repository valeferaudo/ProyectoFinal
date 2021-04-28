import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {

  user: User;
  hiddenSportCenterModal: boolean = false;

  doNotCloseMenu = (event) => event.stopPropagation();

  constructor(private userService: UserService) {
    this.getUserLogged();
   }

  ngOnInit(): void {
  }
  getUserLogged(){
    this.user = this.userService.user;
    this.createSportCenter();
  }
  createSportCenter(){
    if(this.user.role === 'CENTER-SUPER-ADMIN'){
      if(this.user.sportCenter === undefined || this.user.sportCenter === null){
        this.hiddenSportCenterModal=true;
      }
    }
  }
  closeSportCenterModal(closeModal){
    this.hiddenSportCenterModal = closeModal
  }
}
