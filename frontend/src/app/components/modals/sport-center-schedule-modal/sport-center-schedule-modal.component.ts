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
  @Output() closeModal = new EventEmitter<string>();
  @Output() getSportCenter = new EventEmitter<string>();
  @Output() createSchedules = new EventEmitter<string>();

  formsEquals: boolean = false;

  scheduleForm: FormGroup;
  scheduleCombo: Combo[];
  daysSelected;
  openSlide: boolean [] = [false,false,false,false,false,false,false];

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
    this.scheduleCombo.forEach(item => {
      this.schedules.push(this.addScheduleItem(i))
      this.schedules.controls[i].patchValue({
        day: item.id
      })
      i++
    });
  }
  addScheduleItem(i){
    let state;
    if(this.sportCenter.schedules[i] !== undefined){
      if(this.sportCenter.schedules[i].openingHour === null){
        this.openSlide[i] = false;
        state= true;
      }
      else{
        this.openSlide[i] = true;
        state= false;
      }
      return this.fb.group({
        day: [{value:'',disabled:true},[Validators.required],],
        openingHour: [{value:this.setHourString(this.sportCenter.schedules[i].openingHour),disabled:state},[Validators.required],],
        closingHour: [{value:this.setHourString(this.sportCenter.schedules[i].closingHour),disabled:state},[Validators.required],],
      },{validators: this.validatorService.hoursOk("openingHour","closingHour")});
    }
    else{
      return this.fb.group({
        day: [{value:'',disabled:true},[Validators.required],],
        openingHour: [{value:'',disabled:true},[Validators.required],],
        closingHour: [{value:'',disabled:true},[Validators.required],],
      },{validators: this.validatorService.hoursOk("openingHour","closingHour")});
    }
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
}