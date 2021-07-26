import { Component, OnInit } from '@angular/core';
import { UserFilter } from 'src/app/interfaces/filters/userFilter.interface';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {

  hiddenUserModal: boolean = false;
  searchText: string = '';
  users: User[] = [];
  filterON: boolean = false;
  //filter
  filters: UserFilter ={
    text: '',
    state: '',
    userType: 'CENTER-SUPER-ADMIN'
  }
  selectedFilters: string [] = [];
  userStates = ['Activo', 'Bloqueado'];
  //PAGINATOR
  totalPages = null;
  page = 1;
  doNotCloseMenu = (event) => event.stopPropagation();
  userStateSelected : '' | 'Activo' | 'Bloqueado' = '';

  constructor(private userService: UserService,
              private loaderService: LoaderService,
              private errorService: ErrorsService) {}
              
  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(){
    this.filterON = true;
    this.loaderService.openLineLoader();
    this.userService.getUsers(this.filters,this.page)
                    .subscribe((resp:any)=>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.users = resp.param.users;
                        this.selectedFilters = resp.param.selectedFilters;
                        this.page = resp.param.paginator.page;
                        this.totalPages = resp.param.paginator.totalPages;
                        this.filterON = false;
                      }
                    }, (err) => {
                      console.log(err)
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(err.error.code,err.error.msg);
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
      userType: 'CENTER-SUPER-ADMIN'
    }
  }
  createUserModal(){
    this.hiddenUserModal = true;

  }
  closeUserModal(){
    this.hiddenUserModal = false;
  }
  paginate(page){
    this.page = page;
    this.getUsers();
  }
}
