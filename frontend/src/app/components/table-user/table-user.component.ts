import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-table-user',
  templateUrl: './table-user.component.html',
  styleUrls: ['./table-user.component.css']
})
export class TableUserComponent implements OnInit {

  @Input() users: User [];
  @Input() type= '';
  // @Input() totalPages;
  @Output() getUsers = new EventEmitter<boolean>();

  page = 1; 
  userLogged: User;
  searching: boolean = false;
  searchText: string = '';
  refresh: boolean = false;


  constructor(private router: Router,
              private userService: UserService,
              private errorService: ErrorsService,
              private sweetAlertService: SweetAlertService,
              private loaderService: LoaderService) {
                this.userLogged = userService.user
               }

  ngOnInit(): void {
  }
  goUser(id: string){
    this.router.navigateByUrl(`/user/${id}`)
  }
  activateBlockUser(user){
    this.searching = true;
    var swalQuestionObject;
    var swalResponseObject;
    if(user.state === true){
      swalQuestionObject = {
        title: '¿Bloquear usuario?',
        text:'',
        icon: 'question'
      }
      swalResponseObject = {
        title: 'Usuario bloqueado',
        text:'',
        icon: 'success'
      }
    }
    else{
      swalQuestionObject = {
        title: '¿Activar usuario?',
        text: ``,
        icon: 'question'}
      swalResponseObject = {
        title: 'Usuario activado',
        text:'',
        icon: 'success'
        }
    }
    this.sweetAlertService.showSwalConfirmation(swalQuestionObject)
      .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.userService.acceptBlockUser(user.uid)
                        .subscribe( (resp: any)=>{
                          if(resp.ok){
                            this.loaderService.closeLineLoader();
                            this.sweetAlertService.showSwalResponse(swalResponseObject)
                            this.getUsers.emit(true)
                          }
                        }, (err) => {
                          console.log(err)
                          this.errorService.showServerError()
                          this.loaderService.closeLineLoader();
                        })
                  }
      }
    )
  }


  deleteUser(id: string){
    if(id === this.userLogged.uid){
      this.sweetAlertService.showSwalConfirmation({
        title: '¿Desea dar de baja su cuenta?',
        text: ``,
        icon: 'question',})
        .then((result) => {
        if (result.value) {
          this.loaderService.openLineLoader();
          this.userService.deleteUser(id)
                          .subscribe( (resp: any)=>{
                            if (resp.ok === true){
                              this.loaderService.closeLineLoader();
                              this.sweetAlertService.showSwalResponse({
                                title: 'Cuenta dada de baja',
                                text:'Está siendo redirigido/a',
                                icon: "success"})
                              setTimeout(() => {
                                  this.userService.logOut()
                             }, 1000);
                            }
                            else if(resp.ok === false){
                              this.loaderService.closeLineLoader();
                              this.errorService.showErrors(resp.responseCode,resp.descriptionCode)
                            }
                          }, (err) => {
                            this.errorService.showServerError()
                            this.loaderService.closeLineLoader();
                          })
                    }
        }
      )
    }
    else if (id !== this.userLogged.uid){
      this.sweetAlertService.showSwalConfirmation({
        title: '¿Desea dar de baja la cuenta?',
        text: ``,
        icon: 'question',})
        .then((result) => {
        if (result.value) {
          this.loaderService.openLineLoader();
          this.userService.deleteUser(id)
                          .subscribe( (resp: any)=>{
                            if (resp.ok === true){
                              this.sweetAlertService.showSwalResponse({
                                title: 'Cuenta dada de baja',
                                text:'Está siendo redirigido/a',
                                icon: "success"});
                                this.getUsers.emit(true)
                            }
                            else if(resp.ok === false){
                              this.loaderService.closeLineLoader();
                              this.errorService.showErrors(resp.responseCode,resp.descriptionCode)
                            }
                          })
                    }
        }
      )
    }

  }
}
