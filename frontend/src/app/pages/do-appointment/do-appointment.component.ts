import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { ActivatedRoute } from '@angular/router';
import { Combo } from 'src/app/interfaces/combo.interface';
import { AppointmentFilter } from 'src/app/interfaces/filters/appointmentFilter.interface';
import { Field } from 'src/app/models/field.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { FieldService } from 'src/app/services/field.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { ValidatorService } from 'src/app/services/validator.service';

@Component({
  selector: 'app-do-appointment',
  templateUrl: './do-appointment.component.html',
  styleUrls: ['./do-appointment.component.css']
})
export class DoAppointmentComponent  implements OnInit{

  fieldInParam : Field;
  availableAppointments: [] = [];
  searchON: boolean = false;
  isFilter: boolean = false;

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
  minDate = new Date() 
  maxDate = new Date(new Date().getTime() + (20 * 86400000));
  filterObject: AppointmentFilter = {
    sinceDate: new Date(),
    untilDate: new Date(new Date().getTime() + (20 * 86400000)),
    sinceHour: 0,
    untilHour: 23,
  }
  //PAGINATOR
  totalPages = null;
  page = 1;
  registerPerPage = 10;
  showAvailableAppointments = [];
  //Horarios
  scheduleDisplay: boolean = false;
  scheduleForm: FormGroup;
  scheduleCombo: Combo[];
  daysSelected;
  openSlide: boolean [] = [false,false,false,false,false,false,false];
  forgetDays: any [] = [];
  days = ['Lunes','Martes','Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

  constructor(private activateRoute: ActivatedRoute,
              private fieldService: FieldService,
              private fb: FormBuilder,
              private loaderService: LoaderService,
              private appointmentsService: AppointmentService,
              private scheduleService: ScheduleService,
              private sweetAlertService: SweetAlertService,
              private validatorService: ValidatorService,
              private errorService: ErrorsService) {}

  ngOnInit(){
    this.getParam();
    this.formatDates();
  }
  getParam(){
    this.activateRoute.params.subscribe((param: {id: string}) => {
      this.getField(param);
    });
  }
  getField(param){
    this.loaderService.openLineLoader();
    this.fieldService.getField(param.id)
                .subscribe((resp: any) => {
                  this.loaderService.closeLineLoader();
                  if(resp.ok){
                    this.fieldInParam = resp.param.field;
                    this.createScheduleForm();
                  }
                }, (err) => {
                  console.log(err)
                  this.loaderService.closeLineLoader();
                  this.errorService.showErrors(99,'nada')
                });
  }
  createScheduleForm(){
    this.scheduleForm = this.fb.group({
      schedules: new FormArray([])
    })
    this.getScheduleCombo();

  }
  getScheduleCombo(){
    this.scheduleService.getCombo()
                .subscribe((resp: any) =>{
                  if(resp.ok){
                    this.scheduleCombo = resp.param.combo;
                    this.completeScheduleForm();
                  }
                }, (err)=>{
                  console.log(err);
                  this.errorService.showServerError()
                })
  }
  get schedules(){
    return this.scheduleForm.get('schedules') as FormArray;
  }
  completeScheduleForm(){
    let i = 0;
    this.days.forEach(item => {
      this.schedules.push(this.addScheduleItem(i,item))
      i++
    });
    this.fillArraySchedules();
  }
  addScheduleItem(i,item){
    return this.fb.group({
      day: [{value: this.days[i],disabled:true},[Validators.required],],
      openingHour: [{value:null,disabled:true},[Validators.required],],
      closingHour: [{value: null,disabled:true},[Validators.required],],
    },{validators: this.validatorService.hoursOk("openingHour","closingHour")});
  }
  fillArraySchedules(){
    let i = 0;
    this.days.forEach(item => {
      if(this.fieldInParam.sportCenter.schedules[i] !== undefined){
        this.schedules.controls[parseInt(this.fieldInParam.sportCenter.schedules[i].day)-1].patchValue({
          day: this.days[parseInt(this.fieldInParam.sportCenter.schedules[i].day)-1],
          openingHour: this.setHourString(this.fieldInParam.sportCenter.schedules[i].openingHour),
          closingHour: this.setHourString(this.fieldInParam.sportCenter.schedules[i].closingHour)
        })
        this.schedules.controls[parseInt(this.fieldInParam.sportCenter.schedules[i].day)-1].enable();
        this.openSlide[parseInt(this.fieldInParam.sportCenter.schedules[i].day)-1] = true;
      }
      i++
    });
  }
  setHourString(date){
    if(date === null){
      return ''
    }
    else{
      return date.slice(11,16)
    }
  }
  slideChange(event: MatSlideToggle,index){
    this.openSlide[index] = event.checked;
    if(this.openSlide[index] === false){
      this.schedules.controls[index].patchValue({
        day: this.days[index+1],
        openingHour:'',
        closingHour:''
      })
      this.schedules.controls[index].disable()
    }
    if(this.openSlide[index] === true){
      this.schedules.controls[index].enable()
    }
  }
  getSchedulesValid(){
    return this.schedules.invalid &&
            this.schedules.touched
  }
  toggleSchedule(){
    this.scheduleDisplay = !this.scheduleDisplay
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
    this.isFilter = true;
    this.searchON = true;
    this.sinceDateSelected = this.dateRangeForm.controls['sinceDateSelected'].value;
    this.untilDateSelected = this.dateRangeForm.controls['untilDateSelected'].value;
    this.formatDates();
    this.setFilterObject();
    this.getAvailableAppointments();
  }
  filterHour(){
    this.isFilter = true;
    this.searchON = true;
    this.setFilterObject();
    this.getAvailableAppointments();
  }
  setFilterObject(){
    this.filterObject = {
      sinceDate: this.sinceDate,
      untilDate: this.untilDate,
      sinceHour: this.sinceHourSelected,
      untilHour: this.untilHourSelected,
      fieldID: this.fieldInParam.id
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
                      this.setInitPaginate(resp)
                    }
                  }, (err) => {
                  console.log(err)
                  this.loaderService.closeLineLoader();
                  this.errorService.showErrors(99,'nada')
                });
  }
  setInitPaginate(resp){
    this.availableAppointments = resp.param.appointments
    this.totalPages = Math.ceil(this.availableAppointments.length / this.registerPerPage)
    this.showAvailableAppointments = this.availableAppointments.slice(0,this.registerPerPage)
  }
  paginate(page){
    let limit;
    page  * this.registerPerPage > this.availableAppointments.length ? limit = this.availableAppointments.length : limit = page * this.registerPerPage;
    this.page = page;
    this.showAvailableAppointments = this.availableAppointments.slice((this.page - 1) * this.registerPerPage,limit)
  }
}
