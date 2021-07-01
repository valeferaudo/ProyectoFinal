import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../models/user.model';
import { ErrorsService } from '../../../services/errors.service';
import { FieldService } from '../../..//services/field.service';
import { UserService } from '../../../services/user.service';
import { SweetAlertService } from '../../../services/sweet-alert.service';
import { Field } from 'src/app/models/field.model';
import { LoaderService } from 'src/app/services/loader.service';
import { SportCenter } from 'src/app/models/sportCenter.model';
@Component({
  selector: 'app-card-field',
  templateUrl: './card-field.component.html',
  styleUrls: ['./card-field.component.css']
})
export class CardFieldComponent implements OnInit {
  @Input() field: Field;
  userLogged: User;
  hiddenScheduleModal: boolean = false;
  @Output() removeFavorite = new EventEmitter<string>();
  @Output() goSportCenterModal = new EventEmitter<Field>();
  @Output() goScheduleModal = new EventEmitter<Field>();
  @Output() goOpenMap = new EventEmitter<SportCenter>();

  constructor(private router: Router,
              private userService: UserService,
              private fieldService: FieldService,
              private sweetAlertService: SweetAlertService,
              private loaderService: LoaderService,
              private errorService: ErrorsService) {}

  ngOnInit(): void {
    this.userLogged = this.userService.user;
  }
  goAppointment(fieldID){
    this.router.navigateByUrl(`/user/appointment/${fieldID}`)
  }
  goSportCenter(){
    this.goSportCenterModal.emit(this.field)
  }
  openScheduleModal(){
    console.log(this.field)
    this.goScheduleModal.emit(this.field)
  }
  openMap(){
    this.goOpenMap.emit(this.field.sportCenter)
  }
  addFavorite(fieldID){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Agregar a favoritos?',
      text: ``,
      icon: 'question'})
    .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.userService.addRemoveFavorite(fieldID)
                    .subscribe((resp: any) =>{
                      if(resp.ok){
                        this.loaderService.closeLineLoader();
                        this.sweetAlertService.showSwalResponse({
                          title: 'Item agregado',
                          text:'',
                          icon: 'success'
                        })
                        this.userLogged = resp.param.user
                      }
                    },(err)=>{
                      console.log(err);
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(99,'nada');
                    })
      }
    })
  }
  deleteFavorite(fieldID){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Quitar de favoritos?',
      text: ``,
      icon: 'question'})
    .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.userService.addRemoveFavorite(fieldID)
                    .subscribe((resp: any) =>{
                      if(resp.ok){
                        this.loaderService.closeLineLoader();
                        this.sweetAlertService.showSwalResponse({
                          title: 'Item quitado',
                          text:'',
                          icon: 'success'
                        })
                        this.userLogged = resp.param.user;
                        this.removeFavorite.emit(fieldID);
                      }
                    },(err)=>{
                      console.log(err);
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(99,'nada');
                    })
      }
    })
  }
}
