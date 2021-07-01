import { Component, OnInit } from '@angular/core';
import { Field } from 'src/app/models/field.model';
import { SportCenter } from 'src/app/models/sportCenter.model';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {

  searchText: string = '';
  fields: Field [] = [];
  sportCenters: SportCenter [] = [];
  userLogged : User;
  filterFieldON: boolean = false;
  filterSportCenterON: boolean = false;
  //PAGINATOR
  fieldTotalPages = null;
  fieldPage = 1;
  sportCenterTotalPages = null;
  sportCenterPage = 1;
  //modals
  hiddenSportCenterModal: boolean = false;
  fieldSelected: any;
  sportCenterSelected: SportCenter;
  hiddenScheduleModal:boolean = false;
  hiddenOnePointMap:boolean = false;

  constructor(private userService: UserService,
              private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) { }

  ngOnInit(): void {
    this.userLogged = this.userService.user;
    this.getFavorites();
  }
  async getFavorites(){
    await this.getFieldFavorites()
    await this.getSportCenterFavorites();
  }
  getFieldFavorites(){
    this.filterFieldON = true;
    this.loaderService.openLineLoader();
    this.userService.getFavorites('field',this.fieldPage)
                  .subscribe((resp: any)=>{
                    this.loaderService.closeLineLoader();
                    if(resp.ok){
                      this.fields = resp.param.favorites;
                      this.fieldPage = resp.param.paginator.page;
                      this.fieldTotalPages = resp.param.paginator.totalPages;
                      this.filterFieldON = false;
                    }
                  },(err)=>{
                    console.log(err);
                    this.filterFieldON = false;
                    this.loaderService.closeLineLoader();
                    this.errorService.showErrors(99,'nada');
                  })
  }
  getSportCenterFavorites(){
    this.filterSportCenterON = true;
    this.loaderService.openLineLoader();
    this.userService.getFavorites('sportCenter',this.sportCenterPage)
                  .subscribe((resp: any)=>{
                    this.loaderService.closeLineLoader();
                    if(resp.ok){
                      this.sportCenters = resp.param.favorites;
                      this.sportCenterPage = resp.param.paginator.page;
                      this.sportCenterTotalPages = resp.param.paginator.totalPages;
                      this.filterSportCenterON = false;
                    }
                  },(err)=>{
                    console.log(err);
                    this.filterSportCenterON = false;
                    this.loaderService.closeLineLoader();
                    this.errorService.showErrors(99,'nada');
                  })
  }
  removeFavoriteFromArray(item){
    for (let j = 0; j < this.fields.length; j++) {
      if(this.fields[j].id === item){
        this.fields.splice(j,1)
      }
    }
    for (let i = 0; i < this.sportCenters.length; i++) {
      if(this.sportCenters[i].id === item){
        this.sportCenters.splice(i,1)
      }
    }
  }
  paginate(page, type : 'field' | 'sportCenter'){
    switch (type) {
      case 'field':
        this.fieldPage = page;
        this.getFieldFavorites();
        break;
      case 'sportCenter':
        this.sportCenterPage = page;
        this.getSportCenterFavorites();
        break;
    }
  }
  openSportCenterModal(field){
    console.log(field)
    this.fieldSelected = field;
    this.hiddenSportCenterModal = true;
  }
  closeSportCenterModal(){
    this.hiddenSportCenterModal = false;
  }
  openScheduleModal(field){
    this.fieldSelected = field;
    this.hiddenScheduleModal = true;
  }
  closeScheduleModal(){
    this.hiddenScheduleModal = false;
  }
  openMap(sportCenter){
    this.sportCenterSelected = sportCenter;
    this.hiddenOnePointMap = true;
  }
  closeMap(){
    this.hiddenOnePointMap = false;
  }
}
