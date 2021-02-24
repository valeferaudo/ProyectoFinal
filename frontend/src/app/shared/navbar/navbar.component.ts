import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor(private router: Router,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private sweetAlertService: SweetAlertService) { }


searchField(text: string){
  this.router.navigate(['/fields'], {queryParams: {search: text},
                            replaceUrl: true,
                            queryParamsHandling: 'merge'});
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
    this.router.navigateByUrl('/login');
    }, 2000);
  }
});
}

}
