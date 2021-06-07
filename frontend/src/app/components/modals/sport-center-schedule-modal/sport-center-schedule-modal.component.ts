import { isNgTemplate } from '@angular/compiler';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { Combo } from 'src/app/interfaces/combo.interface';
import { SportCenter } from 'src/app/models/sportCenter.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { SportCenterService } from 'src/app/services/sport-center.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { ValidatorService } from 'src/app/services/validator.service';

@Component({
  selector: 'app-sport-center-schedule-modal',
  templateUrl: './sport-center-schedule-modal.component.html',
  styleUrls: ['./sport-center-schedule-modal.component.css']
})
export class SportCenterScheduleModalComponent implements OnInit {
  @Input() hiddenModal: boolean;
  @Input() sportCenter: SportCenter;
  @Input() sportCenterID: string;
  @Input() mode : 'get' | 'update';
  @Output() closeModal = new EventEmitter<string>();
  @Output() getSportCenter = new EventEmitter<string>();
  @Output() createSchedules = new EventEmitter<string>();

  formsEquals: boolean = false;

  scheduleForm: FormGroup;
  scheduleCombo: Combo[];
  daysSelected;
  openSlide: boolean [] = [false,false,false,false,false,false,false];
  forgetDays: any [] = [];
  days = ['Lunes','Martes','Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

  constructor(private fb: FormBuilder,
              private validatorService: ValidatorService,
              private errorService: ErrorsService,
              private sweetAlertService: SweetAlertService,
              private loaderService: LoaderService,
              private sportCenterService: SportCenterService,
              private scheduleService: ScheduleService) { }

  ngOnInit(): void {
    this.createScheduleForm();
    this.getScheduleCombo();
  }
  get schedules(){
    return this.scheduleForm.get('schedules') as FormArray;
  }
  createScheduleForm(){
    this.scheduleForm = this.fb.group({
      schedules: new FormArray([])
    })
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
  completeScheduleForm(){
    let i = 0;
    this.days.forEach(item => {
      this.schedules.push(this.addScheduleItem(i,item))
      i++
    });
    this.fillArraySchedules();
    // this.fillForgetDays();
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
      if(this.sportCenter.schedules[i] !== undefined){
        this.schedules.controls[parseInt(this.sportCenter.schedules[i].day)-1].patchValue({
          day: this.days[parseInt(this.sportCenter.schedules[i].day)-1],
          openingHour: this.setHourString(this.sportCenter.schedules[i].openingHour),
          closingHour: this.setHourString(this.sportCenter.schedules[i].closingHour)
        })
        this.schedules.controls[parseInt(this.sportCenter.schedules[i].day)-1].enable();
        this.openSlide[parseInt(this.sportCenter.schedules[i].day)-1] = true;
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
  closedModal(){
    this.closeModal.emit()
  }
  updateSchedule(){
    if (this.schedules.invalid){
      Object.values(this.schedules.controls).forEach(control=>{
        control.markAsTouched();
      })
      return;
    }
    this.sweetAlertService.showSwalConfirmation({
      title:'¿Editar horarios?',
      icon:'question',
      text:''
    })
    .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.sportCenterService.updateSchedule(this.sportCenter.id,this.scheduleForm.value)
                      .subscribe((resp:any)=>{
                        if(resp.ok){
                          this.loaderService.closeLineLoader();
                          this.sweetAlertService.showSwalResponse({
                            title: 'Horarios modificados',
                            text:'',
                            icon: "success"
                          })
                        }
                        this.getSportCenter.emit();
                        this.closeModal.emit()
                      }, (err) =>{
                        console.log(err)
                          this.errorService.showServerError()
                          this.loaderService.closeLineLoader();
                      })
      }
    })
  }
  getSchedulesValid(){
    return this.schedules.invalid &&
            this.schedules.touched
  }
}
