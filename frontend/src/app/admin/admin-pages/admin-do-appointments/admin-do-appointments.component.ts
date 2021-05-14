import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { ActivatedRoute } from '@angular/router';
import { Combo } from 'src/app/interfaces/combo.interface';
import { AppointmentFilter } from 'src/app/interfaces/filters/appointmentFilter.interface';
import { Field } from 'src/app/models/field.model';
import { User } from 'src/app/models/user.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { FieldService } from 'src/app/services/field.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-admin-do-appointments',
  templateUrl: './admin-do-appointments.component.html',
  styleUrls: ['./admin-do-appointments.component.css']
})
export class AdminDoAppointmentsComponent implements OnInit {

  fieldInParam: boolean = false;
  field: Field = new Field('','');
  fieldID: string;
  fieldsCombo: Combo[] = [];
  userLogged : User;
  fieldSelected: Combo = null;
  doNotCloseMenu = (event) => event.stopPropagation();
  dateRangeForm = new FormGroup({
    sinceDateSelected :new FormControl('',[Validators.required]),
    untilDateSelected : new FormControl('',[Validators.required])
  })
  sinceDateSelected = new Date();
  untilDateSelected = new Date();
  sinceDate: string;
  untilDate: string;
  sinceHourSelected = 0;
  untilHourSelected = 23;
  availableAppointments: [] = [];
  searchON: boolean = false;
  minDate = new Date() 
  maxDate = new Date(new Date().getTime() + (20 * 86400000));
  filterObject: AppointmentFilter = {
    sinceDate: new Date(),
    untilDate: new Date(new Date().getTime() + (20 * 86400000)),
    sinceHour: 0,
    untilHour: 23,
  }
  constructor(private activateRoute: ActivatedRoute,
              private fieldService: FieldService,
              private fb: FormBuilder,
              private userService: UserService,
              private appointmentsService: AppointmentService,
              private sweetAlertService: SweetAlertService,
              private loaderService: LoaderService,
              private dateAdapter: DateAdapter<Date>,
              private errorService: ErrorsService) {}

  ngOnInit(){
    this.dateAdapter.setLocale('es-AR');
    this.userLogged = this.userService.user;
    this.getMode();
    this.formatDates();
  }
  getMode(){
    this.activateRoute.params.subscribe((param: {id: string}) => {
      if(param.id === undefined){
        this.fieldInParam = false;
        this.getFieldCombo();
      }
      else{
        this.getFieldInParam(param.id);
      }
    });
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
  getFieldInParam(fieldID){
    this.loaderService.openLineLoader();
        this.fieldInParam = true;
        this.fieldService.getField(fieldID)
                .subscribe((resp: any) => {
                  this.loaderService.closeLineLoader();
                  if(resp.ok){
                    this.field = resp.param.field;
                    this.fieldID = this.field.id;
                  }
                }, (err) => {
                  console.log(err)
                  this.loaderService.closeLineLoader();
                  this.errorService.showErrors(99,'nada')
                });
  }
  resetFields(){
    this.fieldSelected = null;
    this.resetDates();
    this.resetHour();
    this.setFilterObject();
  }
  resetDates(){
    this.searchON = false;
    this.dateRangeForm.reset();
    this.sinceDateSelected = new Date();
    this.untilDateSelected = new Date();
    this.sinceDate = '';
    this.untilDate = '';
    this.setFilterObject();
  }
  resetHour(){
    this.searchON = false;
    this.sinceHourSelected = 0;
    this.untilHourSelected = 23;
    this.setFilterObject();
  }
  filterDates(){
    if (this.dateRangeForm.invalid){
      Object.values(this.dateRangeForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.searchON = true;
    this.sinceDateSelected = this.dateRangeForm.controls['sinceDateSelected'].value;
    this.untilDateSelected = this.dateRangeForm.controls['untilDateSelected'].value;
    this.formatDates();
    this.setFilterObject();
    this.getAvailableAppointments();
  }
  filterHour(){
    this.searchON = true;
    this.setFilterObject();
    this.getAvailableAppointments();
  }
  setFilterObject(){
    let fieldID;
    if(this.fieldInParam){
      fieldID = this.field.id
    }
    else if(this.fieldSelected !== null){
      fieldID = this.fieldSelected.id;
    }
    else{
      fieldID = null;
    }
    this.filterObject = {
      sinceDate: this.sinceDate,
      untilDate: this.untilDate,
      sinceHour: this.sinceHourSelected,
      untilHour: this.untilHourSelected,
      fieldID: fieldID
    }
  }
  formatDates(){
    let since = this.sinceDateSelected.toISOString();
    let until = this.untilDateSelected.toISOString();
    this.sinceDate = since.slice(0,10);
    this.untilDate = until.slice(0,10);
  }
  getAvailableAppointments(){
    this.loaderService.openLineLoader();
    this.appointmentsService.getAvailableAppointments(this.filterObject)
                  .subscribe((resp:any) => {
                    this.loaderService.closeLineLoader();
                    if(resp.ok){
                      this.availableAppointments = resp.param.appointments
                    }
                  }, (err) => {
                  console.log(err)
                  this.loaderService.closeLineLoader();
                  this.errorService.showErrors(99,'nada')
                });
  }
  setFieldID(){
    this.fieldID = this.fieldSelected.id
  }
}
