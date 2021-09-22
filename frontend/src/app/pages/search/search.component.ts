import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FieldFilter } from 'src/app/interfaces/filters/fieldFilter.interface';
import { SportCenterFilter } from 'src/app/interfaces/filters/sportCenter.interface';
import { Field } from 'src/app/models/field.model';
import { SportCenter } from 'src/app/models/sportCenter.model';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { FieldService } from 'src/app/services/field.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SportCenterService } from 'src/app/services/sport-center.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  hiddenSportCenterModal: boolean = false;
  fieldSelected: any;
  sportCenterSelected: SportCenter;
  hiddenScheduleModal:boolean = false;
  hiddenOnePointMap:boolean = false;
  hiddenGPSModal:boolean = false;
  hiddenCancelPolicyModal: boolean = false;

  sportCenterID;

  searchText: string = '';
  filterON: boolean = false;
  fields: Field [] = [];
  sportCenters: SportCenter [] = [];
  userLogged : User;
  //PAGINATOR
  fieldTotalPages = null;
  sportCenterTotalPages = null;
  fieldPage = 1;
  sportCenterPage = 1;
  fieldFilters: FieldFilter;
  sportCenterFilters: SportCenterFilter;

  constructor(private loaderService: LoaderService,
              private router: Router,
              private fieldService: FieldService,
              private sportCenterService: SportCenterService,
              private activatedRoute: ActivatedRoute,
              private errorService: ErrorsService,) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.searchText = params.search;
      if(params['search'] === undefined){
        this.router.navigateByUrl('/user/home')
      }
      if(this.searchText !== ''){
        this.search();
      }
      else{
        this.router.navigateByUrl('/user/home')
      }
    });
  }
  search(){
    this.getFields();
    this.getSportCenters();
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
  getFields(){
    this.filterON = true;
    this.loaderService.openLineLoader();
    this.fieldService.getFields(this.getFieldFilters(),this.fieldPage)
              .subscribe((resp: any) => {
                this.loaderService.closeLineLoader();
                if(resp.ok){
                  this.fields = resp.param.fields;
                  this.fieldPage = resp.param.paginator.page;
                  this.fieldTotalPages = resp.param.paginator.totalPages;
                  this.filterON = false;
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
    this.sportCenterService.getSportCenters(this.getSportCenterFilter(),this.sportCenterPage)
              .subscribe((resp: any) => {
                this.loaderService.closeLineLoader();
                if(resp.ok){
                  this.sportCenters = resp.param.sportCenters;
                  this.sportCenterPage = resp.param.paginator.page;
                  this.sportCenterTotalPages = resp.param.paginator.totalPages;
                  this.filterON = false;
                }
              },(err)=>{
                console.log(err);
                this.loaderService.closeLineLoader();
                this.errorService.showErrors(err.error.code,err.error.msg);
              })
  }
  getFieldFilters(){
    this.fieldFilters = {
      sportCenterID: '',
      text: this.searchText,
      state: '',
      features: [],
      sports: [],
      days: [],
      sinceHour: 0,
      untilHour: 23,
      available: true,
    }
    return  this.fieldFilters;
  }
  getSportCenterFilter(){
    this.sportCenterFilters = {
      text: this.searchText,
      state: '',
      services: [],
      sports: [],
      days: [],
      sinceHour: 0,
      untilHour: 23,
    }
    return this.sportCenterFilters;
  }
  paginate(page, type : 'field' | 'sportCenter'){
    switch (type) {
      case 'field':
        this.fieldPage = page;
        this.getFields();
        break;
      case 'sportCenter':
        this.sportCenterPage = page;
        this.getSportCenters();
        break;
    }
  }
  openSportCenterModal(object, type : 'field' | 'sportCenter'){
    if (type === 'field'){
      this.sportCenterID = object.sportCenter._id;
      this.fieldSelected = object;
    }
    else if (type === 'sportCenter'){
      this.sportCenterID = object.id
    }
    this.hiddenSportCenterModal = true;
  }
  closeSportCenterModal(){
    this.hiddenSportCenterModal = false;
  }
  openScheduleModal(object , type: 'field'|'sportCenter'){
    if (type === 'field'){
      this.sportCenterSelected = object.sportCenter;
    }
    else if (type === 'sportCenter'){
      this.sportCenterSelected = object
    }
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
  openGPSModal(sportCenter){
    this.sportCenterSelected = sportCenter;
    this.hiddenGPSModal = true;
  }
  closeGPSModal(){
    this.hiddenGPSModal = false;
  }
  openCancelPolicyModal(sportCenter){
    this.sportCenterSelected = sportCenter
    this.hiddenCancelPolicyModal = true;
  }
  closeCancelPolicyModal(){
    this.hiddenCancelPolicyModal = false;
  }
}
