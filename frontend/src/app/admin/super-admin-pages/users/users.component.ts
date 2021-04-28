import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users: User[] = [];

  constructor(private userService: UserService) { 
    this.getUsers();
  }

  ngOnInit(): void {
  }

  getUsers(){
    this.userService.getUsers()
                    .subscribe((resp:any)=>{
                      this.users = resp.param
                    })
  }
}
