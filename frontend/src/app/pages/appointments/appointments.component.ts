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
    fieldID: null
  }
  filterReservedON: boolean = false;
  filterCompletedON: boolean = false;
  filterAboutToStartON: boolean = false;
  filterInProgressON: boolean = false;
  states = ['Reservado','Por comenzar','En progreso','Completado']
  statesSelected = ['Reservado','Por comenzar','En progreso'];
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
    this.appointmenService.getUserAppointments(this.userLogged.uid,this.filterObject)
                                      .subscribe((resp:any) => {
                                        this.loaderService.closeLineLoader();
                                        if(resp.ok){
                                          this.reservedAppointments= resp.param.appointments;
                                          this.filterReservedON = true 
                                        }
                                      }, (err) =>{
                                        console.log(err)
                                        this.errorService.showServerError()
                                        this.loaderService.closeLineLoader();
                                      });
  }
  getAboutToStartAppointments(){
    this.loaderService.openLineLoader();
    this.appointmenService.getUserAppointments(this.userLogged.uid,this.filterObject)
                                      .subscribe((resp:any) => {
                                        this.loaderService.closeLineLoader();
                                        if(resp.ok){
                                          this.aboutToStartAppointments= resp.param.appointments
                                          this.filterAboutToStartON = true;
                                        }
                                      }, (err) =>{
                                        console.log(err)
                                        this.errorService.showServerError()
                                        this.loaderService.closeLineLoader();
                                      });
  }
  getInProgressAppointments(){
    this.loaderService.openLineLoader();
    this.appointmenService.getUserAppointments(this.userLogged.uid,this.filterObject)
                                      .subscribe((resp:any) => {
                                        this.loaderService.closeLineLoader();
                                        if(resp.ok){
                                          this.inProgressAppointments= resp.param.appointments;
                                          this.filterInProgressON = true;
                                        }
                                      }, (err) =>{
                                        console.log(err)
                                        this.errorService.showServerError()
                                        this.loaderService.closeLineLoader();
                                      });
  }
  getCompletedAppointments(){
    this.loaderService.openLineLoader();
    this.appointmenService.getUserAppointments(this.userLogged.uid,this.filterObject)
                                      .subscribe((resp:any) => {
                                        this.loaderService.closeLineLoader();
                                        if(resp.ok){
                                          this.completedAppointments= resp.param.appointments;
                                          this.filterCompletedON = true;
                                        }
                                      }, (err) =>{
                                        console.log(err)
                                        this.errorService.showServerError()
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
  getAppointments(){
    if(this.statesSelected.includes('Reservado')){
      this.filterObject.state= 'Reserved';
      this.getReservedAppointments();
    }else{
      this.filterReservedON = false;
      this.reservedAppointments = []
    }
    if(this.statesSelected.includes('Por comenzar')){
      this.filterObject.state= 'AboutToStart';
      this.getAboutToStartAppointments()
    }else{
      this.filterAboutToStartON = false;
      this.aboutToStartAppointments = []
    }
    if(this.statesSelected.includes('En progreso')){
      this.filterObject.state= 'InProgress';
      this.getInProgressAppointments();
    }else{
      this.filterInProgressON = false;
      this.inProgressAppointments = []
    }
    if(this.statesSelected.includes('Completado')){
      this.filterObject.state= 'Completed';
      this.getCompletedAppointments();
    }else{
      this.filterCompletedON = false;
      this.completedAppointments = []
    }
  }
}
