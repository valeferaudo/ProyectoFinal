import { Component, OnInit } from '@angular/core';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { Service } from 'src/app/models/service.model';
import { ServiceFilter } from 'src/app/interfaces/filters/serviceFilter.interface';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {

  hiddenModal: boolean = false;
  searchText: string = '';
  services: Service[] = [];
  filterON: boolean = false;
  modalMode: 'create' | 'update';
  serviceSelected: Service = null;
  //filter
  filters: ServiceFilter = {
    text: '',
    state: '',
  }
  selectedFilters: string [] = [];
  serviceStates = ['Activo', 'Bloqueado']
  doNotCloseMenu = (event) => event.stopPropagation();
  serviceStateSelected: '' | 'Activo' | 'Bloqueado' = '';

  constructor(private serviceService: ServiceService,
              private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) {}
              
  ngOnInit(): void {
    this.getServices();
  }

  getServices(){
    this.loaderService.openLineLoader();
    this.serviceService.getServices(this.filters)
                    .subscribe((resp:any)=>{
                      this.loaderService.closeLineLoader();
                      if(resp.ok){
                        this.services = resp.param.services;
                        this.selectedFilters = resp.param.selectedFilters
                      }
                    }, (err) => {
                      console.log(err)
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(99,'nada')
                    })
  }
  searchServices(text: string){
    this.searchText = text;
    this.fillFilterObject();
    this.getServices();
  }
  setCheckValue(){
    if(!this.filterON){
      this.serviceStateSelected = ''
    }else{
      this.serviceStateSelected = this.filters.state;
    }
  }
  filterServices(){
    this.filterON = true;
    this.fillFilterObject();
    this.getServices();
  }
  clearFilter(){
    this.filterON = false;
    this.serviceStateSelected = '';
    this.selectedFilters = [];
    this.fillFilterObject();
    this.getServices();
  }
  refreshTable(){
    this.searchText = '';
    this.clearFilter(); 
  }
  fillFilterObject(){
    this.filters = {
      text: this.searchText,
      state: this.serviceStateSelected,
    }
  }
  activateBlockService(service, action: 'active' | 'block'){
    var swalQuestionObject;
    var swalResponseObject;
    if(action === 'block'){
      swalQuestionObject = {
        title: '¿Dar de baja servicio?',
        text:'¡ATENCIÓN! Se dará de baja en todos los centros deportivos',
        icon: 'question'
      }
      swalResponseObject = {
        title: 'Servicio dado de baja',
        text:'',
        icon: 'success'
      }
    }
    else if (action === 'active'){
      swalQuestionObject = {
        title: '¿Activar servicio?',
        text: ``,
        icon: 'question'}
      swalResponseObject = {
        title: 'Servicio activado',
        text:'',
        icon: 'success'
        }
    }
    this.sweetAlertService.showSwalConfirmation(swalQuestionObject)
      .then((result) => {
      if (result.value) {
         this.loaderService.openLineLoader();
         this.serviceService.activeBlockService(service.id, action)
                         .subscribe( (resp: any)=>{
                           if(resp.ok){
                             this.loaderService.closeLineLoader();
                             this.sweetAlertService.showSwalResponse(swalResponseObject);
                             this.getServices();
                           }
                         }, (err) => {
                           console.log(err)
                           this.errorService.showServerError()
                           this.loaderService.closeLineLoader();
                         })
      }
    })
  }
  createServiceModal(){
    this.modalMode = 'create';
    this.hiddenModal = true;
  }
  updateServiceModal(service){
    this.serviceSelected = service
    this.modalMode = 'update';
    this.hiddenModal = true;
  }
  closeModal(){
    this.hiddenModal = false;
  }
}
