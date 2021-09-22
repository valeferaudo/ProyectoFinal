import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Appointment } from 'src/app/models/appointment.model';
import { User } from 'src/app/models/user.model';
import { AppointmentsComponent } from 'src/app/pages/appointments/appointments.component';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-table-appointment',
  templateUrl: './table-appointment.component.html',
  styleUrls: ['./table-appointment.component.css']
})
export class TableAppointmentComponent implements OnInit {

  @Input() text: string;
  @Input() appointments: Appointment[];
  @Input() page: any;
  @Output() getAppointments = new EventEmitter<string>();
  @Output() openPaymentModal = new EventEmitter<Appointment>();

  userLogged: User;

  constructor(private userService: UserService,
              private appointmentService: AppointmentService,
              private router: Router,
              private sweetAlertService: SweetAlertService,
              private loaderService: LoaderService,
              private errorService: ErrorsService) {
    this.userLogged = this.userService.user;
  }

  ngOnInit(): void {
  }
  deleteAppointment(appointment: Appointment){
    if(appointment.state === 'Completed'){
      this.sweetAlertService.showSwalConfirmation({
        title: '¿Eliminar el turno?',
        text: 'El turno ya se completó',
        icon: 'question',
      }).then((result) => {
        if (result.value) {
          this.cancel(appointment,null)
        }
      });
    }
    else{
      if(this.userLogged.role !== 'USER'){
        this.cancelSportCenter(appointment)
      }else{
        this.cancelUser(appointment)
      }
    }
  }
  async cancelSportCenter(appointment){
    if(appointment.totalPaid === 0){
      this.sweetAlertService.showSwalConfirmation({
        title: '¿Cancelar el turno?',
        text: '',
        icon: 'question',
      }).then((result) => {
        if (result.value) {
          this.cancel(appointment,null)
        }
      });
    }else{
      let text = 'Se generará una devolución';
      let description;
      await Swal.fire({
      title: '¿Cancelar turno?',
      customClass: {
        validationMessage: 'my-validation-message'
      },
      html:
        `<p>${text}</p>`+
        '<textarea  id="swal-cancel-description" placeholder="Motivo" cols="30" class="swal2-input" rows="50"></textarea>',
      focusConfirm: false,
      allowOutsideClick: false,
      showCancelButton: true,
      preConfirm: (value) => {
        return [
         description = (document.getElementById('swal-cancel-description') as HTMLInputElement).value
        ];
      }
      }).then((result) => {
        if (result.value) {
          this.cancel(appointment,description)
        }
      });
    }
  }
  async cancelUser(appointment){
    if(appointment.totalPaid === 0){
      this.sweetAlertService.showSwalConfirmation({
        title: '¿Cancelar el turno?',
        text: '',
        icon: 'question',
      }).then((result) => {
        if (result.value) {
          this.cancel(appointment,null)
        }
      });
    }else{
      let description;
      if (this.breakPolicy(appointment)){
        await Swal.fire({
          title: '¿Cancelar turno?',
          customClass: {
            validationMessage: 'my-validation-message'
          },
          html:
            `<span>Por política de cancelación del Centro Deportivo usted</span>`+`<strong> recibirá un reembolso.</strong>`+
            '<textarea  id="swal-cancel-description" placeholder="Motivo" cols="30" class="swal2-input" rows="50"></textarea>',
          focusConfirm: false,
          allowOutsideClick: false,
          showCancelButton: true,
          preConfirm: (value) => {
            return [
             description = (document.getElementById('swal-cancel-description') as HTMLInputElement).value
            ];
          }
          }).then((result) => {
            if (result.value) {
              this.cancel(appointment,description)
            }
          });
      }else{
        this.sweetAlertService.showSwalConfirmation({
          title: '¿Cancelar el turno?',
          text: 'Por política de cancelación del Centro Deportivo usted perderá su dinero.',
          icon: 'question',
        }).then((result) => {
          if (result.value) {
            this.cancel(appointment,null)
          }
        });
      }
    
    }
  }
  cancel(appointment, description){
    this.loaderService.openLineLoader();
          this.appointmentService.deleteAppointment(appointment.id,description)
                                .subscribe((resp: any) => {
                                  if(resp.ok){
                                    this.loaderService.closeLineLoader();
                                    if(appointment.state !== 'Completed'){
                                      this.sendResponse(resp.param.userPhone);
                                    }else{
                                      this.sweetAlertService.showSwalResponse({
                                        title: 'Turno Eliminado',
                                        text:'',
                                        icon: 'success',
                                      })
                                      this.getAppointments.emit();
                                    }
                                  }
                                },(err)=>{
                                  console.log(err);
                                  this.loaderService.closeLineLoader();
                                  this.errorService.showErrors(err.error.code,err.error.msg);
                                })
  }
  sendResponse(phone){
    if(this.userLogged.role === 'CENTER-ADMIN' || this.userLogged.role === 'CENTER-SUPER-ADMIN'){
      this.sweetAlertService.showSwalResponseConfirm({
        title: 'Notifique al usuario',
        text: `Teléfono: ${phone}`,
        icon: 'info',
      }).then((result) => {
        if (result.value) {
          this.sweetAlertService.showSwalResponse({
            title: 'Turno cancelado',
            text:'',
            icon: 'success',
          })
          this.getAppointments.emit();
        }
      })
    }
    else if(this.userLogged.role === 'USER'){
      this.sweetAlertService.showSwalResponse({
        title: 'Turno cancelado',
        text:'',
        icon: 'success',
      })
      this.getAppointments.emit();
    }
  }
  addPayment(appointment){
    this.openPaymentModal.emit(appointment)
  }
  breakPolicy(appointment){
    const diffInMs = Date.parse(appointment.date) - Date.parse(new Date().toISOString());
    const diffInHours = (diffInMs / 1000 / 60 / 60) +   3 ;
    if(diffInHours >= appointment.sportCenter.cancelationHour){
      //no rompe politica
      return true;
    }else{
      return false
    }
  }
}
