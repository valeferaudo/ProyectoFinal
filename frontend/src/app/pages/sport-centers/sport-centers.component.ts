import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { Combo } from 'src/app/interfaces/combo.interface';
import { SportCenterFilter } from 'src/app/interfaces/filters/sportCenter.interface';
import { SportCenter } from 'src/app/models/sportCenter.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { FieldService } from 'src/app/services/field.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ServiceService } from 'src/app/services/service.service';
import { SportCenterService } from 'src/app/services/sport-center.service';
import { SportService } from 'src/app/services/sport.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-sport-centers',
  templateUrl: './sport-centers.component.html',
  styleUrls: ['./sport-centers.component.css']
})
export class SportCentersComponent implements OnInit {

  hiddenSportCenterModal: boolean = false;
  sportCenterSelected: any;
  hiddenScheduleModal:boolean = false;
  hiddenOnePointMap:boolean = false;
  hiddenGPSModal:boolean = false;

  searchText: string = '';
  sportCenters: SportCenter[] = [];
  filterON: boolean = false;
  filters: SportCenterFilter = {
    text: '',
    state: '',
    services: [],
    sports: [],
    days: [],
    sinceHour: 0,
    untilHour: 23,
    available:true
  }
  sportsCombo: Combo[];
  sportsSelected = [];
  servicesCombo: Combo[];
  servicesSelected = [];
  daysCombo: Combo [] = [{'id':'1','text':'Lunes'},{'id':'2','text':'Martes'},{'id':'3','text':'Miércoles'},{'id':'4','text':'Jueves'},{'id':'5','text':'Viernes'},{'id':'6','text':'Sábado'},{'id':'7','text':'Domingo'}]
  daysSelected = [];
  sinceHourSelected = 0;
  untilHourSelected = 23;
  sinceBDPrice;
  untilBDPrice;
  sincePriceSelected = null;
  untilPriceSelected = null;
  selectedFilters: string [] = [];
  //PAGINATOR
  totalPages = null;
  page = 1;
  doNotCloseMenu = (event) => event.stopPropagation();
  //Mapa
  lat: number = -32.9551134;
  lng: number = -60.6883803;
  zoom: number = 12.81;
  mapTypeId: string = 'roadmap';
  sportCentersCombo: any [] = [];

  constructor(private sportService: SportService,
              private sportCenterService: SportCenterService,
              private fieldService: FieldService,
              private router: Router,
              private serviceService: ServiceService,
              private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) {
              }

   ngOnInit(): void {
     this.getCombos();
    }
    getCombos(){
      this.getServicesCombo();
      this.getSportCombo();
      this.getSportCenterCombo();
      this.getSportCenters();
    }
    getServicesCombo(){
      this.loaderService.openLineLoader();
      this.serviceService.getServiceCombo()
                    .subscribe((resp: any)=>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.servicesCombo = resp.param.combo
                      }
                    },(err)=>{
                      console.log(err);
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(err.error.code,err.error.msg);
                    })
    }
    getSportCombo(){
      this.loaderService.openLineLoader();
      this.sportService.getSportCombo()
                      .subscribe((resp: any) => {
                        this.loaderService.closeLineLoader();
                        if(resp.ok){
                          this.sportsCombo = resp.param.combo
                        }
                      },(err)=>{
                        console.log(err);
                        this.loaderService.closeLineLoader();
                        this.errorService.showErrors(err.error.code,err.error.msg);
                      })
    }
    getSportCenterCombo(){
      this.loaderService.openLineLoader();
      this.sportCenterService.getSportCenterCombo()
                      .subscribe((resp: any) => {
                        this.loaderService.closeLineLoader();
                        if(resp.ok){
                          this.sportCentersCombo = resp.param.combo
                        }
                      },(err)=>{
                        console.log(err);
                        this.loaderService.closeLineLoader();
                        this.errorService.showErrors(err.error.code,err.error.msg);
                      })
    }
    getSportCenters(){
      this.filterON = true;
      this.loaderService.openLineLoader();
      this.sportCenterService.getSportCenters(this.filters,this.page)
                .subscribe((resp: any) => {
                  this.loaderService.closeLineLoader();
                  if(resp.ok){
                    this.sportCenters = resp.param.sportCenters;
                    this.selectedFilters = resp.param.selectedFilters;
                    this.page = resp.param.paginator.page;
                    this.totalPages = resp.param.paginator.totalPages;
                    this.filterON = false;
                  }
                },(err)=>{
                  console.log(err);
                  this.loaderService.closeLineLoader();
                  this.errorService.showErrors(err.error.code,err.error.msg);
                })
    }
    searchSportCenters(text: string){
      this.searchText = text;
      this.fillFilterObject();
      this.getSportCenters();
    }
    refreshTable(){
      this.searchText = '';
      this.clearFilter(); 
    }
    clearFilter(){
      this.filterON = false;
      this.sportsSelected = [];
      this.servicesSelected = [];
      this.daysSelected = [];
      this.sinceHourSelected = 0;
      this.untilHourSelected = 23;
      this.sincePriceSelected = null;
      this.untilPriceSelected = null;
      this.selectedFilters = [];
      this.fillFilterObject();
      this.getSportCenters();
    }
    changeSportSelected(event:MatCheckboxChange,sport){
      if(event.checked){
        this.sportsSelected.push(sport.id)
      }
      else{
        var i = this.sportsSelected.indexOf( sport.id );
        if ( i !== -1 ) {
            this.sportsSelected.splice( i, 1 );
        }
      }
    }
    resetSports(){
      this.sportsSelected = [];
      this.fillFilterObject();
      this.getSportCenters();
    }
    filterSports(){
      this.fillFilterObject();
      this.getSportCenters();
    }
    changeServiceSelected(event:MatCheckboxChange,service){
      if(event.checked){
        this.servicesSelected.push(service.id)
      }
      else{
        var i = this.servicesSelected.indexOf( service.id );
        if ( i !== -1 ) {
            this.servicesSelected.splice( i, 1 );
        }
      }
    }
    resetServices(){
      this.servicesSelected = [];
      this.fillFilterObject();
      this.getSportCenters();
    }
    filterServices(){
      this.fillFilterObject();
      this.getSportCenters();
    }
    changeDaysSelected(event:MatCheckboxChange,day){
      this.daysSelected.splice(0,1);
      this.daysSelected.push(day.id);
    }
    resetDays(){
      this.daysSelected = [];
      this.fillFilterObject();
      this.getSportCenters();
    }
    filterDays(){
      this.fillFilterObject();
      this.getSportCenters();
    }
    resetHour(){
      // this.searchON = false;
      this.sinceHourSelected = 0;
      this.untilHourSelected = 23;
      this.fillFilterObject();
      this.getSportCenters();
    }
    filterHour(){
      // this.searchON = true;
      this.fillFilterObject();
      this.getSportCenters();
    }
    fillFilterObject(){
      this.filters = {
        text: this.searchText,
        state: '',
        sports: this.sportsSelected,
        days:this.daysSelected,
        services: this.servicesSelected,
        sinceHour: this.sinceHourSelected,
        untilHour: this.untilHourSelected,
        available:true
      }
    }
    openSportCenterModal(sportCenter){
      this.sportCenterSelected = sportCenter;
      this.hiddenSportCenterModal = true;
    }
    closeSportCenterModal(){
      this.hiddenSportCenterModal = false;
    }
    openScheduleModal(sportCenter){
      this.sportCenterSelected = sportCenter;
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
    goFields(fieldID){
      this.router.navigateByUrl(`/user/fields/${fieldID}`)
    }
    paginate(page){
      this.page = page;
      this.getSportCenters();
    }
    openGPSModal(sportCenter){
      this.sportCenterSelected = sportCenter;
      this.hiddenGPSModal = true;
    }
    closeGPSModal(){
      this.hiddenGPSModal = false;
    }
}
