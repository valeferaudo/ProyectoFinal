import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ActivatedRoute, Router } from '@angular/router';
import { Combo } from 'src/app/interfaces/combo.interface';
import { FieldFilter } from 'src/app/interfaces/filters/fieldFilter.interface';
import { Field } from 'src/app/models/field.model';
import { User } from 'src/app/models/user.model';
import { FeatureService } from 'src/app/services/feature.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SportService } from 'src/app/services/sport.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { ErrorsService } from '../../services/errors.service';
import { FieldService } from '../../services/field.service'

@Component({
  selector: 'app-fields',
  templateUrl: './fields.component.html',
  styleUrls: ['./fields.component.css']
})
export class FieldsComponent implements OnInit {

  sportCenterInParam: string = '';
  searchText: string = '';
  fields: Field[] = [];
  filterON: boolean = false;
  filters: FieldFilter = {
    sportCenterID: '',
    text: '',
    state: '',
    features: [],
    sports: [],
    sinceHour: 1,
    untilHour: 23,
  }
  sportsCombo: Combo[];
  sportsSelected = [];
  featureCombo: Combo[];
  featuresSelected = [];
  sinceHourSelected = 0;
  untilHourSelected = 23;
  sinceBDPrice;
  untilBDPrice;
  sincePriceSelected = null;
  untilPriceSelected = null;
  selectedFilters: string [] = [];
  doNotCloseMenu = (event) => event.stopPropagation();

  constructor(private fieldService: FieldService,
              private activatedRoute: ActivatedRoute,
              private location: Location,
              private featureService: FeatureService,
              private sportService: SportService,
              private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) {
              }

   ngOnInit(): void {
     this.getCombos();
    }
    getCombos(){
      this.getFeatureCombo();
      this.getSportCombo();
      this.getPrices();
      this.getSportCenterInParam();
    }
    getFeatureCombo(){
      this.featureService.getCombo()
                    .subscribe((resp: any)=>{
                      if(resp.ok){
                        this.featureCombo = resp.param.combo
                      }
                    },(err)=>{
                      console.log(err);
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(99,'nada');
                    })
    }
    getSportCombo(){
      this.sportService.getSportCombo()
                      .subscribe((resp: any) => {
                        if(resp.ok){
                          this.sportsCombo = resp.param.combo
                        }
                      },(err)=>{
                        console.log(err);
                        this.errorService.showErrors(99,'nada');
                      })
    }
    getPrices(){
      this.fieldService.getMinMaxPrices()
                  .subscribe((resp: any) => {
                    if(resp.ok){
                      this.sinceBDPrice = resp.param.minPrice;
                      this.sincePriceSelected = this.sinceBDPrice;
                      this.untilBDPrice = resp.param.maxPrice;
                      this.untilPriceSelected = this.untilBDPrice;
                    }
                  },(err)=>{
                    console.log(err);
                    this.errorService.showErrors(99,'nada');
                  })
    }
    getSportCenterInParam(){
      this.activatedRoute.params.subscribe(params => {
        this.sportCenterInParam = params.id === undefined ? '' : params.id;
        this.fillFilterObject();
        this.getFields();
    });
    }
    goBack(){
      this.location.back();
    }
    getFields(){
      this.fieldService.getFields(this.filters)
                .subscribe((resp: any) => {
                  if(resp.ok){
                    this.fields = resp.param.fields;
                    this.selectedFilters = resp.param.selectedFilters;
                  }
                },(err)=>{
                  console.log(err);
                  this.errorService.showErrors(99,'nada');
                })
    }
    searchFields(text: string){
      this.searchText = text;
      this.fillFilterObject();
      this.getFields();
    }
    refreshTable(){
      this.searchText = '';
      this.clearFilter(); 
    }
    clearFilter(){
      this.filterON = false;
      this.sportsSelected = [];
      this.featuresSelected = [];
      this.sinceHourSelected = 0;
      this.untilHourSelected = 23;
      this.sincePriceSelected = this.sinceBDPrice;
      this.untilPriceSelected = this.untilBDPrice;
      this.selectedFilters = [];
      this.fillFilterObject();
      this.getFields();
    }
    changeSportSelected(event:MatCheckboxChange,sport){
      if(event.checked){
        this.sportsSelected.push(sport)
      }
      else{
        var i = this.sportsSelected.indexOf( sport );
        if ( i !== -1 ) {
            this.sportsSelected.splice( i, 1 );
        }
      }
    }
    resetSports(){
      this.sportsSelected = [];
      this.fillFilterObject();
      this.getFields();
    }
    filterSports(){
      this.fillFilterObject();
      this.getFields();
    }
    changeFeatureSelected(event:MatCheckboxChange,feature){
      if(event.checked){
        this.featuresSelected.push(feature)
      }
      else{
        var i = this.featuresSelected.indexOf( feature );
        if ( i !== -1 ) {
            this.featuresSelected.splice( i, 1 );
        }
      }
    }
    resetFeatures(){
      this.featuresSelected = [];
      this.fillFilterObject();
      this.getFields();
    }
    filterFeatures(){
      this.fillFilterObject();
      this.getFields();
    }
    resetHour(){
      // this.searchON = false;
      this.sinceHourSelected = 0;
      this.untilHourSelected = 23;
      this.fillFilterObject();
      this.getFields();
    }
    filterHour(){
      // this.searchON = true;
      this.fillFilterObject();
      this.getFields();
    }
    resetPrice(){
      this.sincePriceSelected = this.sinceBDPrice;
      this.untilPriceSelected = this.untilBDPrice;
      this.fillFilterObject();
      this.getFields();
    }
    filterPrice(){
      this.fillFilterObject();
      this.getFields();
    }
    fillFilterObject(){
      this.filters = {
        text: this.searchText,
        // sports: this.sportsSelected,
        state: '',
        sportCenterID: this.sportCenterInParam,
        features: this.featuresSelected,
        sincePrice: this.sincePriceSelected,
        untilPrice: this.untilPriceSelected,
        sinceHour: this.sinceHourSelected,
        untilHour: this.untilHourSelected,
      }
    }
}
