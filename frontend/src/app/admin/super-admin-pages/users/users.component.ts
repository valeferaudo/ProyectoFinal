import { Component, OnInit } from '@angular/core';
import { UserFilter } from 'src/app/interfaces/filters/userFilter.interface';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  searchText: string = '';
  users: User[] = [];

  //filter
  filters: UserFilter ={
    text: '',
    state: '',
    userType: 'SUPER-ADMIN'
  }
  selectedFilters = '';
  userStates = ['Activo', 'Bloqueado']
  doNotCloseMenu = (event) => event.stopPropagation();
  userStateSelected : '' | 'Activo' | 'Bloqueado' = '';

  constructor(private userService: UserService) { 
    this.getUsers();
  }

  ngOnInit(): void {
  }

  getUsers(){
    this.userService.getUsers(this.filters)
                    .subscribe((resp:any)=>{
                      this.users = resp.param
                    })
  }
  searchUsers(text: string){
    this.searchText = text;
    this.fillFilterObject();
    this.getUsers();
  }
  setCheckValue(){
    //ACA VALIDAR SI BUSCO POR ALGUN TIPO Y SINO BUSCA QUE LIMPIE EL CHECK M
  }
  filterUsers(){
    this.selectedFilters = this.userStateSelected;
    this.fillFilterObject();
    this.getUsers();
  }
  clearFilter(){
    this.userStateSelected = '';
    this.selectedFilters = '';
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
