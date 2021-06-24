import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SportCenter } from 'src/app/models/sportCenter.model';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { FieldService } from 'src/app/services/field.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-card-sport-center',
  templateUrl: './card-sport-center.component.html',
  styleUrls: ['./card-sport-center.component.css']
})
export class CardSportCenterComponent implements OnInit {

  @Input() sportCenter: SportCenter;
  userLogged: User;
  @Output() removeFavorite = new EventEmitter<string>();
  @Output() goSportCenterModal = new EventEmitter<SportCenter>();
  @Output() goScheduleModal = new EventEmitter<SportCenter>();
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
  getFields(fieldID){
    this.router.navigateByUrl(`/user/fields/${fieldID}`)
  }
  openScheduleModal(){
    this.goScheduleModal.emit(this.sportCenter)
  }
  openMap(sportCenterID){
    this.goOpenMap.emit(sportCenterID)
  }
  addFavorite(sportCenterID){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Agregar a favoritos?',
      text: ``,
      icon: 'question'})
    .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.userService.addRemoveFavorite(sportCenterID)
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
  deleteFavorite(sportCenterID){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Quitar de favoritos?',
      text: ``,
      icon: 'question'})
    .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.userService.addRemoveFavorite(sportCenterID)
                    .subscribe((resp: any) =>{
                      if(resp.ok){
                        this.loaderService.closeLineLoader();
                        this.sweetAlertService.showSwalResponse({
                          title: 'Item quitado',
                          text:'',
                          icon: 'success'
                        })
                        this.userLogged = resp.param.user;
                        this.removeFavorite.emit(sportCenterID);
                      }
                    },(err)=>{
                      console.log(err);
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(99,'nada');
                    })
      }
    })
  }
  openSportCenterModal(){
    this.goSportCenterModal.emit(this.sportCenter)
  }
}
