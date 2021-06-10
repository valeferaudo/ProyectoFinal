import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FieldFilter } from 'src/app/interfaces/filters/fieldFilter.interface';
import { Field } from 'src/app/models/field.model';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { FieldService } from 'src/app/services/field.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-admin-fields',
  templateUrl: './admin-fields.component.html',
  styleUrls: ['./admin-fields.component.css']
})
export class AdminFieldsComponent implements OnInit {

  userLogged: User;
  hiddenFieldModal: boolean = false;
  hiddenSportModal: boolean = false;
  hiddenPriceHistorialModal: boolean = false;
  searchText: string = '';
  fields: Field[] = [];
  filterON: boolean = false;
  modalMode: 'create' | 'update';
  fieldSelected: Field = null;
  //filter
  filters: FieldFilter = {
    sportCenterID: '',
    text: '',
    state: '',
    features:[],
    sports: [],
    days: []
  }
  selectedFilters: string [] = [];
  fieldStates = ['Activo', 'Bloqueado']
  doNotCloseMenu = (event) => event.stopPropagation();
  fieldStateSelected: '' | 'Activo' | 'Bloqueado' = '';

  constructor(private fieldService: FieldService,
              private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService,
              private userService: UserService) {}
              
  ngOnInit(): void {
    this.userLogged = this.userService.user;
    this.fillFilterObject();
    this.getFields();
  }
  getFields(){
    this.loaderService.openLineLoader();
    this.fieldService.getFields(this.filters)
                    .subscribe((resp:any)=>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.fields = resp.param.fields;
                        this.selectedFilters = resp.param.selectedFilters;
                      }
                    }, (err) => {
                      console.log(err)
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(99,'nada')
                    })
  }
  searchFields(text: string){
    this.searchText = text;
    this.fillFilterObject();
    this.getFields();
  }
  setCheckValue(){
    if(!this.filterON){
      this.fieldStateSelected = ''
    }else{
      this.fieldStateSelected = this.filters.state;
    }
  }
  filterFields(){
    this.filterON = true;
    this.fillFilterObject();
    this.getFields();
  }
  clearFilter(){
    this.filterON = false;
    this.fieldStateSelected = '';
    this.selectedFilters = [];
    this.fillFilterObject();
    this.getFields();
  }
  refreshTable(){
    this.searchText = '';
    this.clearFilter(); 
  }
  fillFilterObject(){
    this.filters = {
      text: this.searchText,
      state: this.fieldStateSelected,
      sportCenterID: this.userLogged.sportCenter.id,
      features:[],
      sports: [],
      days: []
    }
  }
  activateBlockField(field, action: 'active' | 'block'){
    var swalQuestionObject;
    var swalResponseObject;
    if(action === 'block'){
      swalQuestionObject = {
        title: '¿Dar de baja la cancha?',
        text:'',
        icon: 'question'
      }
      swalResponseObject = {
        title: 'Cancha dada de baja',
        text:'',
        icon: 'success'
      }
    }
    else if (action === 'active'){
      swalQuestionObject = {
        title: '¿Activar cancha?',
        text: ``,
        icon: 'question'}
      swalResponseObject = {
        title: 'Cancha activada',
        text:'',
        icon: 'success'
        }
    }
    this.sweetAlertService.showSwalConfirmation(swalQuestionObject)
      .then((result) => {
      if (result.value) {
         this.loaderService.openLineLoader();
         this.fieldService.activateBlockField(field.id, action)
                         .subscribe( (resp: any)=>{
                           if(resp.ok){
                             this.loaderService.closeLineLoader();
                             this.sweetAlertService.showSwalResponse(swalResponseObject);
                             this.getFields();
                           }
                         }, (err) => {
                           console.log(err)
                           this.errorService.showServerError()
                           this.loaderService.closeLineLoader();
                         })
      }
    })
  }
  createFieldModal(){
    this.modalMode = 'create';
    this.hiddenFieldModal = true;
  }
  updateFieldModal(field){
    this.fieldSelected = field
    this.modalMode = 'update';
    this.hiddenFieldModal = true;
  }
  closeFieldModal(){
    this.hiddenFieldModal = false;
    this.fieldSelected = null;
  }
  createFieldSportModal(){
    this.modalMode = 'create';
    console.log(this.fieldSelected)
    this.hiddenSportModal = true;
  }
  updateFieldSport(field){
    this.fieldSelected = field
    this.modalMode = 'update';
    this.hiddenSportModal = true;
  }
  closeFieldSportModal(){
    this.hiddenSportModal = false;
  }
  setNewField(field){
    //falta pasar bien el fieldSelected, porque llega null
      // this.fieldSelected = field;
      // this.createFieldSportModal();
  }
  openPriceHistorial(field){
    this.fieldSelected = field;
    this.hiddenPriceHistorialModal = true;
  }
  closePriceHistorial(){
    this.hiddenPriceHistorialModal = false;
  }
}
