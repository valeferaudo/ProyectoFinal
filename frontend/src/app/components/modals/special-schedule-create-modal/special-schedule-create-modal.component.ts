import { Component, EventEmitter, Input, OnInit, Output, resolveForwardRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { Appointment } from 'src/app/models/appointment.model';
import { User } from 'src/app/models/user.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-special-schedule-create-modal',
  templateUrl: './special-schedule-create-modal.component.html',
  styleUrls: ['./special-schedule-create-modal.component.css']
})
export class SpecialScheduleCreateModalComponent implements OnInit {

  @Input() hiddenModal: boolean;
  @Output() closeModal = new EventEmitter<string>();
  specialScheduleForm : FormGroup;
  userLogged: User;
  minDate = new Date();
  filterObject;
  reservedAppointment: Appointment [] = [];
  totalAppointments = null;

  constructor(private scheduleService: ScheduleService,
              private loaderService: LoaderService,
              private userService: UserService,
              private appointmentService: AppointmentService,
              private sweetAlertService: SweetAlertService,
              private dateAdapter: DateAdapter<Date>,
              private fb: FormBuilder,
              private errorService: ErrorsService ) { }

  ngOnInit(): void {
    this.userLogged = this.userService.user;
    this.dateAdapter.setLocale('es-AR');
    this.createForm();
    // this.getMinDate();
    this.listenerForm();
  }
  createForm(){
    this.specialScheduleForm = this.fb.group({
      date:["",[Validators.required],],
      sinceHour:["",[Validators.required],],
      untilHour:["",[Validators.required],],
    })
  }
  closedModal(){
    this.closeModal.emit();
  }
  getFieldValid(field : string){
    return this.specialScheduleForm.get(field).invalid &&
            this.specialScheduleForm.get(field).touched
  }
  createSpecialSchedule(){
    if (this.specialScheduleForm.invalid){
      Object.values(this.specialScheduleForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Crear fecha especial?',
      text: `Los turnos para la fecha indicada serán cancelados.`,
      icon: 'question'})
    .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.scheduleService.createSpecialSchedule(this.userLogged.sportCenter.id, this.specialScheduleForm.value)
                        .subscribe((resp: any) =>{
                          this.loaderService.closeLineLoader();
                          if(resp.ok){
                            this.sweetAlertService.showSwalResponse({
                              title: 'Fecha especial creada',
                              text:'Los dueños de los turnos para la fecha especificada fueron notificados vía mail',
                              icon: 'success'
                            });
                            this.closedModal();                      }
                        },(err)=>{
                          console.log(err);
                          this.loaderService.closeLineLoader();
                          this.errorService.showErrors(err.error.code,err.error.msg);
                        })
      }
    })
  }
  // getMinDate(){
  //   this.minDate.setDate(this.minDate.getDate() + 1)
  // }
  listenerForm(){
    this.specialScheduleForm.valueChanges
                .subscribe((form:any)=>{
                  if(form.date !== '' && form.sinceHour !== '' && form.untilHour !== ''){
                    this.filterObject = {
                      date: form.date,
                      sinceHour: form.sinceHour,
                      untilHour: form.untilHour
                    }
                    this.appointmentService.getReservedSportCenterAppointments(this.userLogged.sportCenter.id,this.filterObject)
                                          .subscribe((resp: any)=>{
                                            this.reservedAppointment = resp.param.appointments;
                                            this.totalAppointments = resp.param.total
                                          })
                  }
                })
  }
}
