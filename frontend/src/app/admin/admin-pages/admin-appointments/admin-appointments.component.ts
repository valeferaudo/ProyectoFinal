import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange, TransitionCheckState } from '@angular/material/checkbox';
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
  selector: 'app-admin-appointments',
  templateUrl: './admin-appointments.component.html',
  styleUrls: ['./admin-appointments.component.css']
})
export class AdminAppointmentsComponent implements OnInit {

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
    stateReserved: 0,
    stateAboutToStart:  1,
    stateInProgress:  1,
    stateCompleted:  1,
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
  statesSelected = ['Reservado'];
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
    this.getFieldCombo();

  }
  getFieldCombo(){
    this.fieldService.getFieldCombo(this.userLogged.sportCenter.id)
                  .subscribe((resp: any) => {
                    if(resp.ok){
                      this.fieldsCombo = resp.param.combo;
                    }
                  }, (err) => {
                    console.log(err)
                    this.loaderService.closeLineLoader();
                    this.errorService.showErrors(99,'nada')
                  });
  }
  getAppointments(){
    this.loaderService.openLineLoader();
    this.appointmenService.getSportCenterAppointments(this.userLogged.sportCenter.id,this.filterObject)
                                      .subscribe((resp:any) => {
                                        this.loaderService.closeLineLoader();
                                        if(resp.ok){
                                          this.reservedAppointments= resp.param.reservedAppointments;
                                          this.aboutToStartAppointments = resp.param.aboutToStartAppointments;
                                          this.inProgressAppointments = resp.param.inProgressAppointments;
                                          this.completedAppointments = resp.param.completedAppointments;
                                          this.setStateFilter();
                                        }
                                      }, (err) =>{
                                        console.log(err)
                                        this.errorService.showServerError()
                                        this.loaderService.closeLineLoader();
                                      });
  }
  setStateFilter(){
    this.statesSelected.includes('Reservado') ? this.filterReservedON = true : this.filterReservedON = false;
    this.statesSelected.includes('Por comenzar') ? this.filterAboutToStartON = true : this.filterAboutToStartON = false;
    this.statesSelected.includes('En progreso') ? this.filterInProgressON = true : this.filterInProgressON = false;
    this.statesSelected.includes('Completado') ? this.filterCompletedON = true : this.filterCompletedON = false;
  }
  fillFilterObject(){
    this.filterObject = {
      stateReserved: this.statesSelected.includes('Reservado') ? 0 : 1,
      stateAboutToStart:  this.statesSelected.includes('Por comenzar') ? 0 : 1,
      stateInProgress:  this.statesSelected.includes('En progreso') ? 0 : 1,
      stateCompleted:  this.statesSelected.includes('Completado') ? 0 : 1,
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
      let index = 0;
      this.statesSelected.forEach(element => {
        if(element === state){
          this.statesSelected.splice(index,1);
          return;
        }
        index = index + 1;
      });
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
  //NO SE SI SE USAN
  getAboutToStartAppointments(){
    this.loaderService.openLineLoader();
    this.appointmenService.getSportCenterAppointments(this.userLogged.sportCenter.id,this.filterObject)
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
    this.appointmenService.getSportCenterAppointments(this.userLogged.sportCenter.id,this.filterObject)
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
    this.appointmenService.getSportCenterAppointments(this.userLogged.sportCenter.id,this.filterObject)
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
}
