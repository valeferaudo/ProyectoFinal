import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { DateAdapter } from '@angular/material/core';
import { Combo } from 'src/app/interfaces/combo.interface';
import { AppointmentTableFilter } from 'src/app/interfaces/filters/appointmentTableFilter.Interface';
import { User } from 'src/app/models/user.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { FieldService } from 'src/app/services/field.service';
import { LoaderService } from 'src/app/services/loader.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent {

  reservedAppointments = [];
  aboutToStartAppointments = [];
  inProgressAppointments = [];
  completedAppointments = [];
  userLogged: User;
  //FILTROS
  fieldsCombo: Combo[] = [];
  fieldSelected = null;
  fieldID = null;
  doNotCloseMenu = (event) => event.stopPropagation();
  dateRangeForm = new FormGroup({
    sinceDateSelected :new FormControl('',[Validators.required]),
    untilDateSelected : new FormControl('',[Validators.required])
  })
  sinceDateSelected = null;
  untilDateSelected = null;
  sinceDate: string;
  untilDate: string;
  sinceHourSelected = 0;
  untilHourSelected = 23;
  maxDate = new Date(new Date().getTime() + (25 * 86400000));
  filterObject: AppointmentTableFilter = {
    state: null,
    sinceDate: null,
    untilDate: null,
    sinceHour: 0,
    untilHour: 23,
    fieldID: null,
    payment: null
  }
  filterReservedON: boolean = false;
  filterCompletedON: boolean = false;
  filterAboutToStartON: boolean = false;
  filterInProgressON: boolean = false;
  states = ['Reservado','Por comenzar','En progreso','Completado']
  statesSelected = ['Reservado'];
  payments = ['Total','Parcial','Sin Pagos'];
  paymentSelected: 'Total' | 'Parcial' | 'Sin Pagos';
  //PAGINATOR
  reservedTotalPages = null;
  reservedPage = 1;
  aboutToStartTotalPages = null;
  aboutToStartPage = 1;
  inProgressTotalPages = null;
  inProgressPage = 1;
  completedTotalPages = null;
  completedPage = 1;

  hiddenPaymentModal = false;
  appointmentSelected = null;
  
  constructor(private appointmenService: AppointmentService,
              private errorService: ErrorsService,
              private userService: UserService,
              private fieldService: FieldService,
              private dateAdapter: DateAdapter<Date>,
              private loaderService: LoaderService) {}

  ngOnInit(): void {
    this.dateAdapter.setLocale('es-AR');
    this.userLogged = this.userService.user
    this.getAppointments();
    this.formatDates();
  }
  getReservedAppointments(){
    this.loaderService.openLineLoader();
    this.appointmenService.getUserAppointments(this.userLogged.uid,this.filterObject,this.reservedPage)
                                      .subscribe((resp:any) => {
                                        this.loaderService.closeLineLoader();
                                        if(resp.ok){
                                          this.reservedAppointments= resp.param.appointments;
                                          this.reservedPage = resp.param.paginator.page;
                                          this.reservedTotalPages = resp.param.paginator.totalPages;
                                          this.filterReservedON = true;
                                        }
                                      }, (err) =>{
                                        console.log(err);
                                        this.filterReservedON = true;
                                        this.errorService.showErrors(err.error.code,err.error.msg);
                                        this.loaderService.closeLineLoader();
                                      });
  }
  getAboutToStartAppointments(){
    this.loaderService.openLineLoader();
    this.appointmenService.getUserAppointments(this.userLogged.uid,this.filterObject,this.aboutToStartPage)
                                      .subscribe((resp:any) => {
                                        this.loaderService.closeLineLoader();
                                        if(resp.ok){
                                          this.aboutToStartAppointments= resp.param.appointments;
                                          this.aboutToStartPage = resp.param.paginator.page;
                                          this.aboutToStartTotalPages = resp.param.paginator.totalPages;
                                          this.filterAboutToStartON = true;
                                        }
                                      }, (err) =>{
                                        console.log(err);
                                        this.filterAboutToStartON = true;
                                        this.errorService.showErrors(err.error.code,err.error.msg);
                                        this.loaderService.closeLineLoader();
                                      });
  }
  getInProgressAppointments(){
    this.loaderService.openLineLoader();
    this.appointmenService.getUserAppointments(this.userLogged.uid,this.filterObject,this.inProgressPage)
                                      .subscribe((resp:any) => {
                                        this.loaderService.closeLineLoader();
                                        if(resp.ok){
                                          this.inProgressAppointments= resp.param.appointments;
                                          this.inProgressPage = resp.param.paginator.page;
                                          this.inProgressTotalPages = resp.param.paginator.totalPages;
                                          this.filterInProgressON = true;
                                        }
                                      }, (err) =>{
                                        console.log(err);
                                        this.filterInProgressON = true;
                                        this.errorService.showErrors(err.error.code,err.error.msg);
                                        this.loaderService.closeLineLoader();
                                      });
  }
  getCompletedAppointments(){
    this.loaderService.openLineLoader();
    this.appointmenService.getUserAppointments(this.userLogged.uid,this.filterObject,this.completedPage)
                                      .subscribe((resp:any) => {
                                        this.loaderService.closeLineLoader();
                                        if(resp.ok){
                                          this.completedAppointments= resp.param.appointments;
                                          this.completedPage = resp.param.paginator.page;
                                          this.completedTotalPages = resp.param.paginator.totalPages;
                                          this.filterCompletedON = true;
                                        }
                                      }, (err) =>{
                                        console.log(err);
                                        this.filterCompletedON = true;
                                        this.errorService.showErrors(err.error.code,err.error.msg);
                                        this.loaderService.closeLineLoader();
                                      });
  }
  fillFilterObject(){
    this.filterObject = {
      state: null,
      sinceDate: this.sinceDate,
      untilDate: this.untilDate,
      sinceHour: this.sinceHourSelected,
      untilHour: this.untilHourSelected,
      fieldID: this.fieldID,
      payment: this.paymentSelected
    }
  }
  clearFilters(){
    this.fieldSelected = null;
    this.statesSelected = ['Reservado'];
    this.sinceDateSelected = null;
    this.sinceDate = null;
    this.untilDateSelected = null;
    this.untilDate = null;
    this.sinceHourSelected = 0;
    this.untilHourSelected = 23;
    this.fieldSelected = null;
    this.fieldID = null;
    this.fillFilterObject();
    this.getAppointments();
  }
  changeStateSelected(event:MatCheckboxChange,state){
    if(event.checked){
      this.statesSelected.push(state)
    }
    else{
      var i = this.statesSelected.indexOf( state );
      if ( i !== -1 ) {
          this.statesSelected.splice( i, 1 );
      }
    }
  }
  formatDates(){
    if(this.sinceDateSelected !== null && this.untilDateSelected !== null){
      let since = this.sinceDateSelected.toISOString();
      let until = this.untilDateSelected.toISOString();
      this.sinceDate = since.slice(0,10);
      this.untilDate = until.slice(0,10);
    }
    else{
      this.sinceDate = null;
      this.untilDate = null;
    }
  }
  filterDates(){
    if (this.dateRangeForm.invalid){
      Object.values(this.dateRangeForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.sinceDateSelected = this.dateRangeForm.controls['sinceDateSelected'].value;
    this.untilDateSelected = this.dateRangeForm.controls['untilDateSelected'].value;
    this.formatDates();
    this.fillFilterObject();
    this.getAppointments();
  }
  resetDates(){
    this.dateRangeForm.reset();
    this.sinceDateSelected = null;
    this.untilDateSelected = null;
    this.sinceDate = null;
    this.untilDate = null;
    this.fillFilterObject();
    this.getAppointments();
  }
  filterHour(){
    this.fillFilterObject();
    this.getAppointments();
  }
  resetHour(){
    this.sinceHourSelected = 0;
    this.untilHourSelected = 23;
    this.fillFilterObject();
    this.getAppointments();
  }
  filterField(){
    this.fieldID = this.fieldSelected.id;
    this.fillFilterObject();
    this.getAppointments();
  }
  resetField(){
    this.fieldSelected = null;
    this.fillFilterObject();
    this.getAppointments();
  }
  filterStates(){
    this.fillFilterObject();
    this.getAppointments();
  }
  resetStates(){
    this.statesSelected = ['Reservado'];
    this.fillFilterObject();
    this.getAppointments();
  }
  filterPayment(){
    this.fillFilterObject();
    this.getAppointments();
  }
  resetPayment(){
    this.paymentSelected = null;
    this.fillFilterObject();
    this.getAppointments();
  }
  getAppointments(){
    if(this.statesSelected.includes('Reservado')){
      this.filterObject.state= 'Reserved';
      this.getReservedAppointments();
    }else{
      this.filterReservedON = false;
      this.reservedPage = 1;
      this.reservedAppointments = [];
    }
    if(this.statesSelected.includes('Por comenzar')){
      this.filterObject.state= 'AboutToStart';
      this.getAboutToStartAppointments()
    }else{
      this.filterAboutToStartON = false;
      this.aboutToStartPage = 1;
      this.aboutToStartAppointments = [];
    }
    if(this.statesSelected.includes('En progreso')){
      this.filterObject.state= 'InProgress';
      this.getInProgressAppointments();
    }else{
      this.filterInProgressON = false;
      this.inProgressPage = 1;
      this.inProgressAppointments = [];
    }
    if(this.statesSelected.includes('Completado')){
      this.filterObject.state= 'Completed';
      this.getCompletedAppointments();
    }else{
      this.filterCompletedON = false;
      this.completedPage = 1;
      this.completedAppointments = [];
    }
  }
  paginate(page, type : 'reserved' | 'aboutToStart' | 'inProgress' | 'completed'){
    switch (type) {
      case 'reserved':
        this.reservedPage = page;
        this.getReservedAppointments();
        break;
      case 'aboutToStart':
        this.aboutToStartPage = page;
        this.getAboutToStartAppointments();
        break;
      case 'inProgress':
        this.inProgressPage = page;
        this.getInProgressAppointments();
        break;
      case 'completed':
        this.completedPage = page;
        this.getCompletedAppointments();
      break;
    }
  }
  openPaymentModal(appointment){
    this.appointmentSelected = appointment;
    this.hiddenPaymentModal = true;
  }
  closePaymentModal(boolean){
    this.getAppointments();    
    this.hiddenPaymentModal = false;
  }
}
