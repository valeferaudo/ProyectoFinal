import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
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
  doNotCloseMenu = (event) => event.stopPropagation();

  constructor(private sportService: SportService,
              private sportCenterService: SportCenterService,
              private fieldService: FieldService,
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
                      this.errorService.showErrors(99,'nada');
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
                        this.errorService.showErrors(99,'nada');
                      })
    }
    getSportCenters(){
      this.filterON = true;
      this.loaderService.openLineLoader();
      this.sportCenterService.getSportCenters(this.filters)
                .subscribe((resp: any) => {
                  this.loaderService.closeLineLoader();
                  if(resp.ok){
                    this.sportCenters = resp.param.sportCenters;
                    this.selectedFilters = resp.param.selectedFilters;
                    this.filterON = false;
                  }
                },(err)=>{
                  console.log(err);
                  this.loaderService.closeLineLoader();
                  this.errorService.showErrors(99,'nada');
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
      if(event.checked){
        this.daysSelected.push(day.id)
      }
      else{
        var i = this.daysSelected.indexOf( day.id );
        if ( i !== -1 ) {
            this.daysSelected.splice( i, 1 );
        }
      }
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
}
