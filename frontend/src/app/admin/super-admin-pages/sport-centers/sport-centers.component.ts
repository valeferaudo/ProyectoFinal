import { Component, OnInit } from '@angular/core';
import { SportCenterFilter } from 'src/app/interfaces/filters/sportCenter.interface';
import { SportCenter } from 'src/app/models/sportCenter.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SportCenterService } from 'src/app/services/sport-center.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-sport-centers',
  templateUrl: './sport-centers.component.html',
  styleUrls: ['./sport-centers.component.css']
})
export class SportCentersComponent implements OnInit {

  hiddenModal: boolean = false;
  searchText: string = '';
  sportCenters: SportCenter[] = [];
  filterON: boolean = false;
  sportCenterSelected: SportCenter = null;
  sportCenterID: string = null;
  //filter
  filters: SportCenterFilter = {
    text: '',
    state: '',
    services: [],
    days: [],
    sports: [],
    sinceHour: 1,
    untilHour:23
  }
  selectedFilters: string [] = [];
  sportCenterStates = ['Activo', 'Bloqueado'];
  //PAGINATOR
  totalPages = null;
  page = 1;
  doNotCloseMenu = (event) => event.stopPropagation();
  sportCenterStateSelected: '' | 'Activo' | 'Bloqueado' = '';

  constructor(private sportCenterService: SportCenterService,
              private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) {}
              
  ngOnInit(): void {
    this.getSportCenters();
  }

  getSportCenters(){
    this.loaderService.openLineLoader();
    this.sportCenterService.getSportCenters(this.filters,this.page)
                    .subscribe((resp:any)=>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.sportCenters = resp.param.sportCenters;
                        this.selectedFilters = resp.param.selectedFilters;
                        this.page = resp.param.paginator.page;
                        this.totalPages = resp.param.paginator.totalPages;
                      }
                    }, (err) => {
                      console.log(err)
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(99,'nada')
                    })
  }
  searchSportCenters(text: string){
    this.searchText = text;
    this.fillFilterObject();
    this.getSportCenters();
  }
  setCheckValue(){
    if(!this.filterON){
      this.sportCenterStateSelected = ''
    }else{
      this.sportCenterStateSelected = this.filters.state;
    }
  }
  filterSportCenters(){
    this.filterON = true;
    this.fillFilterObject();
    this.getSportCenters();
  }
  clearFilter(){
    this.filterON = false;
    this.sportCenterStateSelected = '';
    this.selectedFilters = [];
    this.fillFilterObject();
    this.getSportCenters();
  }
  refreshTable(){
    this.searchText = '';
    this.clearFilter(); 
  }
  fillFilterObject(){
    this.filters = {
      text: this.searchText,
      state: this.sportCenterStateSelected,
      services: [],
      days: [],
      sports: [],
      sinceHour: 1,
      untilHour:23
    }
  }
  activateBlockSportCenter(sportCenter, action: 'active' | 'block'){
    var swalQuestionObject;
    var swalResponseObject;
    if(action === 'block'){
      swalQuestionObject = {
        title: '¿Dar de baja centro deportivo?',
        text:'¡ATENCIÓN! Se dará de baja todo lo referido con el centro deportivo',
        icon: 'question'
      }
      swalResponseObject = {
        title: 'Centro deportivo dado de baja',
        text:'',
        icon: 'success'
      }
    }
    else if (action === 'active'){
      swalQuestionObject = {
        title: '¿Activar centro deportivo?',
        text: ``,
        icon: 'question'}
      swalResponseObject = {
        title: 'Centro deportivo activado',
        text:'',
        icon: 'success'
        }
    }
    this.sweetAlertService.showSwalConfirmation(swalQuestionObject)
      .then((result) => {
      if (result.value) {
         this.loaderService.openLineLoader();
         this.sportCenterService.activateBlockSportCenter(sportCenter.id, action)
                         .subscribe( (resp: any)=>{
                           if(resp.ok){
                             this.loaderService.closeLineLoader();
                             this.sweetAlertService.showSwalResponse(swalResponseObject);
                             this.getSportCenters();
                           }
                         }, (err) => {
                           console.log(err)
                           this.errorService.showServerError()
                           this.loaderService.closeLineLoader();
                         })
      }
    })
  }
  goSportCenter(sportCenter){
    this.sportCenterSelected = sportCenter
    this.sportCenterID = sportCenter.id;
    this.hiddenModal = true;
  }
  closeModal(){
    this.hiddenModal = false;
  }
  paginate(page){
    this.page = page;
    this.getSportCenters();
  }
}
