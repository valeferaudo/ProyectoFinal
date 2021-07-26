import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit{
  userLogged : User;
  searchText = '';
  
  constructor(private router: Router,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private sweetAlertService: SweetAlertService) {
    }
    
  ngOnInit(){
  this.userLogged = this.userService.user;
  this.cleanInput();
  } 
  searchField(){
    if(this.searchText !== ''){
      this.router.navigate(['/user/search'], {queryParams: {search: this.searchText},
                              replaceUrl: true,
                              queryParamsHandling: 'merge'});
    }
  }
  logOut(){
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
        }, 1000);
      }
    });
  }
  cleanInput(){
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.search === undefined){
        this.searchText= '';
      }
    })
  }
}
