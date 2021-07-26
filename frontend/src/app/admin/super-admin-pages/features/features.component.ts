import { Component, OnInit } from '@angular/core';
import { FeatureFilter } from 'src/app/interfaces/filters/featureFilter.interface';
import { Feature } from 'src/app/models/feature.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { FeatureService } from 'src/app/services/feature.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css']
})
export class FeaturesComponent implements OnInit {

  hiddenModal: boolean = false;
  searchText: string = '';
  features: Feature[] = [];
  filterON: boolean = false;
  modalMode: 'create' | 'update';
  featureSelected: Feature = null;
  //filter
  filters: FeatureFilter = {
    text: '',
    state: '',
  }
  selectedFilters: string [] = [];
  featureStates = ['Activo', 'Bloqueado'];
  //PAGINATOR
  totalPages = null;
  page = 1;
  doNotCloseMenu = (event) => event.stopPropagation();
  featureStateSelected: '' | 'Activo' | 'Bloqueado' = '';

  constructor(private featureService: FeatureService,
              private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) {}
              
  ngOnInit(): void {
    this.getFeatures();
  }

  getFeatures(){
    this.loaderService.openLineLoader();
    this.featureService.getFeatures(this.filters,this.page)
                    .subscribe((resp:any)=>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.features = resp.param.features;
                        this.selectedFilters = resp.param.selectedFilters;
                        this.page = resp.param.paginator.page;
                        this.totalPages = resp.param.paginator.totalPages;
                      }
                    }, (err) => {
                      console.log(err)
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(err.error.code,err.error.msg);
                    })
  }
  searchFeatures(text: string){
    this.searchText = text;
    this.fillFilterObject();
    this.getFeatures();
  }
  setCheckValue(){
    if(!this.filterON){
      this.featureStateSelected = ''
    }else{
      this.featureStateSelected = this.filters.state;
    }
  }
  filterFeatures(){
    this.filterON = true;
    this.fillFilterObject();
    this.getFeatures();
  }
  clearFilter(){
    this.filterON = false;
    this.featureStateSelected = '';
    this.selectedFilters = [];
    this.fillFilterObject();
    this.getFeatures();
  }
  refreshTable(){
    this.searchText = '';
    this.clearFilter(); 
  }
  fillFilterObject(){
    this.filters = {
      text: this.searchText,
      state: this.featureStateSelected,
    }
  }
  activateBlockFeature(feature, action: 'active' | 'block'){
    var swalQuestionObject;
    var swalResponseObject;
    if(action === 'block'){
      swalQuestionObject = {
        title: '¿Dar de baja característica?',
        text:'¡ATENCIÓN! Se dará de baja en todos los centros deportivos',
        icon: 'question'
      }
      swalResponseObject = {
        title: 'Característica dada de baja',
        text:'',
        icon: 'success'
      }
    }
    else if (action === 'active'){
      swalQuestionObject = {
        title: '¿Activar característica?',
        text: ``,
        icon: 'question'}
      swalResponseObject = {
        title: 'Característica activada',
        text:'',
        icon: 'success'
        }
    }
    this.sweetAlertService.showSwalConfirmation(swalQuestionObject)
      .then((result) => {
      if (result.value) {
         this.loaderService.openLineLoader();
         this.featureService.activeBlockFeature(feature.id, action)
                         .subscribe( (resp: any)=>{
                           if(resp.ok){
                             this.loaderService.closeLineLoader();
                             this.sweetAlertService.showSwalResponse(swalResponseObject);
                             this.getFeatures();
                           }
                         }, (err) => {
                           console.log(err)
                           this.errorService.showErrors(err.error.code,err.error.msg);
                           this.loaderService.closeLineLoader();
                         })
      }
    })
  }
  createFeatureModal(){
    this.modalMode = 'create';
    this.hiddenModal = true;
  }
  updateFeatureModal(feature){
    this.featureSelected = feature
    this.modalMode = 'update';
    this.hiddenModal = true;
  }
  closeModal(){
    this.hiddenModal = false;
  }
  paginate(page){
    this.page = page;
    this.getFeatures();
  }
}
