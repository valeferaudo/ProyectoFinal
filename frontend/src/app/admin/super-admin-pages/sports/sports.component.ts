import { Component, OnInit } from '@angular/core';
import { SportFilter } from 'src/app/interfaces/filters/sportFilter.interface';
import { Sport } from 'src/app/models/sport.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SportService } from 'src/app/services/sport.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-sports',
  templateUrl: './sports.component.html',
  styleUrls: ['./sports.component.css']
})
export class SportsComponent implements OnInit {
  
  hiddenModal: boolean = false;
  searchText: string = '';
  sports: Sport[] = [];
  filterON: boolean = false;
  modalMode: 'create' | 'update';
  sportSelected: Sport = null;
  //filter
  filters: SportFilter = {
    text: '',
    state: '',
  }
  selectedFilters: string [] = [];
  sportStates = ['Activo', 'Bloqueado']
  doNotCloseMenu = (event) => event.stopPropagation();
  sportStateSelected: '' | 'Activo' | 'Bloqueado' = '';

  constructor(private sportService: SportService,
              private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) {}
              
  ngOnInit(): void {
    this.getSports();
  }

  getSports(){
    this.loaderService.openLineLoader();
    this.sportService.getSports(this.filters)
                    .subscribe((resp:any)=>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.sports = resp.param.sports;
                        this.selectedFilters = resp.param.selectedFilters
                      }
                    }, (err) => {
                      console.log(err)
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(99,'nada')
                    })
  }
  searchSports(text: string){
    this.searchText = text;
    this.fillFilterObject();
    this.getSports();
  }
  setCheckValue(){
    if(!this.filterON){
      this.sportStateSelected = ''
    }else{
      this.sportStateSelected = this.filters.state;
    }
  }
  filterSports(){
    this.filterON = true;
    this.fillFilterObject();
    this.getSports();
  }
  clearFilter(){
    this.filterON = false;
    this.sportStateSelected = '';
    this.selectedFilters = [];
    this.fillFilterObject();
    this.getSports();
  }
  refreshTable(){
    this.searchText = '';
    this.clearFilter(); 
  }
  fillFilterObject(){
    this.filters = {
      text: this.searchText,
      state: this.sportStateSelected,
    }
  }
  activateBlockSport(sport, action: 'active' | 'block'){
    var swalQuestionObject;
    var swalResponseObject;
    if(action === 'block'){
      swalQuestionObject = {
        title: '¿Dar de baja deporte?',
        text:'¡ATENCIÓN! Se darán de baja todas las canchas que sean de este deporte',
        icon: 'question'
      }
      swalResponseObject = {
        title: 'Deporte dado de baja',
        text:'',
        icon: 'success'
      }
    }
    else if (action === 'active'){
      swalQuestionObject = {
        title: '¿Activar deporte?',
        text: ``,
        icon: 'question'}
      swalResponseObject = {
        title: 'Deporte activado',
        text:'',
        icon: 'success'
        }
    }
    this.sweetAlertService.showSwalConfirmation(swalQuestionObject)
      .then((result) => {
      if (result.value) {
         this.loaderService.openLineLoader();
         this.sportService.acceptBlockSport(sport.id, action)
                         .subscribe( (resp: any)=>{
                           if(resp.ok){
                             this.loaderService.closeLineLoader();
                             this.sweetAlertService.showSwalResponse(swalResponseObject);
                             this.getSports();
                           }
                         }, (err) => {
                           console.log(err)
                           this.errorService.showServerError()
                           this.loaderService.closeLineLoader();
                         })
      }
    })
  }
  createSportModal(){
    this.modalMode = 'create';
    this.hiddenModal = true;
  }
  updateSportModal(sport){
    this.sportSelected = sport
    this.modalMode = 'update';
    this.hiddenModal = true;
  }
  closeModal(){
    this.hiddenModal = false;
  }
}
