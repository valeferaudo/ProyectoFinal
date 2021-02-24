import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Field } from 'src/app/models/field.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { FieldService } from 'src/app/services/field.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-do-appointment',
  templateUrl: './do-appointment.component.html',
  styleUrls: ['./do-appointment.component.css']
})
export class DoAppointmentComponent  {

  public field;
  since: Date;
  until: Date;
  now: Date;
  empty: boolean;
  available = [];

  default  = new Date(Date.now()).toISOString().split('T')[0];


  appointmentForm: FormGroup;

  constructor(private activateRoute: ActivatedRoute,
              private fieldService: FieldService,
              private fb: FormBuilder,
              private appointmentsService: AppointmentService,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) {
    this.activateRoute.params.subscribe((param: {id: string}) => {
                this.fieldService.getField(param.id)
                          .subscribe((resp: Field) => {
                            this.field = resp;
                          });
    });
    this.createForm();
    this.listenerForm();
  }

  createForm(){
    this.appointmentForm = this.fb.group({
      sinceDate : [this.default, Validators.required],
      untilDate : [null, Validators.required]
    });
  }

  search(){
    this.appointmentsService.getAvailableAppointments(this.appointmentForm.value, this.field.id)
                            .subscribe(resp => {
                              this.available = resp;
                            });
  }
  getFieldValid(field: string){
    return this.appointmentForm.get(field).invalid &&
            this.appointmentForm.get(field).touched;
 }

   listenerForm(){
     this.appointmentForm.valueChanges
              .subscribe(data => {
                this.now = new Date(Date.now());
                this.since = this.setDateSince(data.sinceDate);
                if (data.sinceDate !== null){
                   if (this.since.getTime() <= Date.now()){
                     this.sweetAlertService.showSwalResponse({
                       title:'Fecha menor a hoy',
                       text:'Por favor, cambiarla',
                       icon:'error'
                     })
                     this.appointmentForm.patchValue({sinceDate: this.default});
                   }
                  }
                if (data.untilDate !== null){
                  this.until = this.setDateUntil(data.untilDate);
                  if (this.until.getTime() <= Date.now()){
                    this.sweetAlertService.showSwalResponse({
                      title:'Fecha menor a hoy',
                      text:'Por favor, cambiarla',
                      icon:'error'
                    })
                      this.appointmentForm.patchValue({untilDate: null});
                    }
                  }else{
                        this.appointmentForm.patchValue({
                          untilDate: data.sinceDate
                        });
                  }
                if (this.since !== null && this.until !== null && this.since !== undefined && this.until !== null){
                   if (this.since.getTime() > this.until.getTime()){
                    this.sweetAlertService.showSwalResponse({
                      title:'Error de menor a hoy',
                      text:'Por favor, cambiarla',
                      icon:'error'
                    })
                  // Swal.fire('Error de fechas', 'Fecha "desde" debe ser menor o igual a fecha "hasta"', 'error');
                   this.appointmentForm.patchValue({sinceDate: this.default});
                   }
                   if ((this.until.getTime() > this.now.setDate(this.now.getDate() + 8))) {
                    this.sweetAlertService.showSwalResponse({
                      title:'Fecha menor a hoy',
                      text:'Por favor, cambiarla',
                      icon:'error'
                    })
                    //Swal.fire('Error de fechas', 'Solo se puede buscar hasta 7 días posteriores', 'error');
                    this.appointmentForm.patchValue({untilDate: null});
                   }
                   if ((this.since.getTime() > this.now.setDate(this.now.getDate() + 8))) {
                    this.sweetAlertService.showSwalResponse({
                      title:'Fecha menor a hoy',
                      text:'Por favor, cambiarla',
                      icon:'error'
                    })
                    //Swal.fire('Error de fechas', 'Solo se puede buscar hasta 7 días posteriores', 'error');
                    this.appointmentForm.patchValue({untilDate: null});
                   }
                 }
               });
   }

   setDateSince(dateSince: string): Date{
     const today = new Date();
     if (dateSince !== undefined){
       this.since = new Date(dateSince.replace(/-/g, '\/'));
       this.since.setHours(today.getHours());
       this.since.setMinutes(today.getMinutes());
       this.since.setSeconds(today.getSeconds() + 30);
       return this.since;
     }
    }
    setDateUntil(dateUntil: string): Date{
       this.until = new Date(dateUntil.replace(/-/g, '\/'));
       this.until.setDate(this.until.getDate() + 1);
       return this.until;
    }

}
