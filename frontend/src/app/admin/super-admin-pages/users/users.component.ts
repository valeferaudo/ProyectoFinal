import { Component, OnInit } from '@angular/core';
import { UserFilter } from 'src/app/interfaces/filters/userFilter.interface';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  searchText: string = '';
  users: User[] = [];
  filterON: boolean = false;
  //filter
  filters: UserFilter ={
    text: '',
    state: '',
    userType: 'SUPER-ADMIN'
  }
  selectedFilters: string [] = [];
  userStates = ['Activo', 'Bloqueado']
  doNotCloseMenu = (event) => event.stopPropagation();
  userStateSelected : '' | 'Activo' | 'Bloqueado' = '';

  constructor(private userService: UserService,
              private loaderService: LoaderService,
              private errorService: ErrorsService) {}
              
  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(){
    this.loaderService.openLineLoader();
    this.userService.getUsers(this.filters)
                    .subscribe((resp:any)=>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.users = resp.param.users;
                        this.selectedFilters = resp.param.selectedFilters
                      }
                    }, (err) => {
                      console.log(err)
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(99,'nada')
                    })
  }
  searchUsers(text: string){
    this.searchText = text;
    this.fillFilterObject();
    this.getUsers();
  }
  setCheckValue(){
    if(!this.filterON){
      this.userStateSelected = ''
    }else{
      this.userStateSelected = this.filters.state;
    }
  }
  filterUsers(){
    this.filterON = true;
    this.fillFilterObject();
    this.getUsers();
  }
  clearFilter(){
    this.filterON = false;
    this.userStateSelected = '';
    this.selectedFilters = [];
    this.fillFilterObject();
    this.getUsers();
  }
  refreshTable(){
    this.searchText = '';
    this.clearFilter(); 
  }
  fillFilterObject(){
    this.filters = {
      text: this.searchText,
      state: this.userStateSelected,
      userType: 'SUPER-ADMIN'
    }
  }
}
