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
  @Input() page;
  @Output() getUsers = new EventEmitter<boolean>();

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
  activateBlockUser(user, action: 'active' | 'block'){
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
        this.userService.acceptBlockUser(user.uid, action)
                        .subscribe( (resp: any)=>{
                          if(resp.ok){
                            this.loaderService.closeLineLoader();
                            this.sweetAlertService.showSwalResponse(swalResponseObject)
                            this.getUsers.emit(true)
                          }
                        }, (err) => {
                          console.log(err)
                          this.errorService.showErrors(err.error.code,err.error.msg);
                          this.loaderService.closeLineLoader();
                        })
                  }
      }
    )
  }
  changeRole(user: User){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Cambiar rol del usuario?',
      text: ``,
      icon: 'question',
    })
    .then((result) => {
      if (result.value) {
      this.loaderService.openLineLoader();
      this.userService.changeRole(user.uid)
                        .subscribe((resp: any) => {
                          if(resp.ok){
                            this.loaderService.closeLineLoader();
                            this.sweetAlertService.showSwalResponse({
                              title: 'Rol cambiado',
                              text:'',
                              icon: 'success',
                            })
                            this.getUsers.emit();
                          }
                        }, (err) => {
                          console.log(err);
                          this.loaderService.closeLineLoader();
                          this.errorService.showErrors(err.error.code,err.error.msg);
                        });
      }
    })
  }
}
