import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RequestFilter } from 'src/app/interfaces/filters/requestFilter.interface';
import { Request } from 'src/app/models/request.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { RequestService } from 'src/app/services/request.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-request-do',
  templateUrl: './request-do.component.html',
  styleUrls: ['./request-do.component.css']
})
export class RequestDoComponent implements OnInit {

  requests: Request[] = [];
  searchText: string = '';
  filterON: boolean = false;
  requestSelected: Request = null;
  //filter
  filters: RequestFilter = {
    section: '',
    text: '',
    state: '',
    seen: ''
  }
  selectedFilters: string [] = [];
  requestSections = ['CARACTERÍSTICA','DEPORTE','SERVICIO']
  requestStates = ['Aceptada', 'Rechazada', 'En pausa'];
  requestSeens = ['Vista', 'No vista'];
  //PAGINATOR
  totalPages = null;
  page = 1;
  doNotCloseMenu = (event) => event.stopPropagation();
  requestStateSelected: '' | 'Aceptada' | 'Rechazada' | 'En pausa' = '';
  requestSeenSelected: '' | 'Vista' | 'No vista' = '';
  requestSectionSelected: '' | 'CARACTERÍSTICA' | 'DEPORTE' | 'SERVICIO' = '';
  constructor(private requestService: RequestService,
              private errorService: ErrorsService,
              private sweetAlertService: SweetAlertService,
              private loaderService: LoaderService,
              private router: Router) { }

  ngOnInit(): void {
    this.getRequests();
  }
  getRequests(){
    this.loaderService.openLineLoader();
    this.requestService.getRequests(this.filters,this.page)
              .subscribe( (resp: any) => {
                if(resp.ok){
                  this.loaderService.closeLineLoader();
                  this.requests = resp.param.requests;
                  this.page = resp.param.paginator.page;
                  this.totalPages = resp.param.paginator.totalPages;
                }
              }, (err) => {
                console.log(err)
                this.loaderService.closeLineLoader();
                this.errorService.showErrors(err.error.code,err.error.msg);
              });
  }
  acceptBlockRequest(request: Request, action: 'active' | 'block'){
    var swalQuestionObject;
    var swalResponseObject;
    if(action === 'block'){
      swalQuestionObject = {
        title: '¿Rechazar solicitud?',
        text:'',
        icon: 'question'
      }
      swalResponseObject = {
        title: 'Solicitud rechazada',
        text:'',
        icon: 'success'
      }
    }
    else if (action === 'active'){
      swalQuestionObject = {
        title: '¿Aceptar solicitud?',
        text: ``,
        icon: 'question'}
      swalResponseObject = {
        title: 'Solicitud aceptada',
        text:'',
        icon: 'success'
        }
    }
    this.sweetAlertService.showSwalConfirmation(swalQuestionObject)
      .then((result) => {
      if (result.value) {
         this.loaderService.openLineLoader();
         this.requestService.activeBlockRequest(request.id, action)
                         .subscribe( (resp: any)=>{
                           if(resp.ok){
                             this.loaderService.closeLineLoader();
                             this.sweetAlertService.showSwalResponse(swalResponseObject);
                             this.goAhead(request,action);
                           }
                         }, (err) => {
                           console.log(err)
                           this.errorService.showErrors(err.error.code,err.error.msg);
                           this.loaderService.closeLineLoader();
                         })
      }
    })
  }
  goAhead(request: Request, action: 'active' | 'block'){
    if(action === 'active'){
      if(request.section === 'CARACTERÍSTICA'){
        this.router.navigateByUrl('admin/super/features')
      }
      else if(request.section === 'DEPORTE'){
        this.router.navigateByUrl('admin/super/sports')
      }
      else if(request.section === 'SERVICIO'){
        this.router.navigateByUrl('admin/super/services')
      }
    }
    else if(action === 'block'){
      this.getRequests();
    }
  }
  markAsSeen(request: Request){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Marcar como vista?',
      text: ``,
      icon: 'question',
    })
    .then((result) => {
      if (result.value) {
            this.loaderService.openLineLoader();
            this.requestService.markAsSeen(request.id)
                    .subscribe((resp: any) => {
                      if(resp.ok){
                        this.sweetAlertService.showSwalResponse({
                          title: 'Solicitud marcada',
                          text:'',
                          icon: 'success',
                        })
                        this.loaderService.closeLineLoader();
                        this.getRequests();
                      }
                    }, (err) => {
                      console.log(err)
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors(err.error.code,err.error.msg);
                    });
      }
    })
  }
  searchRequests(text: string){
    this.searchText = text;
    this.fillFilterObject();
    this.getRequests();
  }
  fillFilterObject(){
    this.filters = {
      text: this.searchText,
      state: this.requestStateSelected,
      seen: this.requestSeenSelected,
      section: this.requestSectionSelected
    }
  }
  setCheckValue(){
    if(!this.filterON){
      this.requestStateSelected = '';
      this.requestSeenSelected = '';
      this.requestSectionSelected = '';
    }else{
      this.requestStateSelected = this.filters.state;
      this.requestSeenSelected = this.filters.seen;
      this.requestSectionSelected = this.filters.section;
    }
  }
  refreshTable(){
    this.searchText = '';
    this.clearFilter(); 
  }
  clearFilter(){
    this.filterON = false;
    this.requestStateSelected = '';
    this.requestSeenSelected = '';
    this.requestSectionSelected = '';
    this.selectedFilters = [];
    this.fillFilterObject();
    this.getRequests();
  }
  filterRequests(){
    this.filterON = true;
    this.fillFilterObject();
    this.getRequests();
  }
  paginate(page){
    this.page = page;
    this.getRequests();
  }
}
