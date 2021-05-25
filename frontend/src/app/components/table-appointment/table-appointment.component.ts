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

@Component({
  selector: 'app-table-appointment',
  templateUrl: './table-appointment.component.html',
  styleUrls: ['./table-appointment.component.css']
})
export class TableAppointmentComponent implements OnInit {

  @Input() text: string;
  @Input() appointments: Appointment[];
  @Output() getAppointments = new EventEmitter<string>();
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
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Cancelar el turno?',
      text: ``,
      icon: 'question',
    }).then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.appointmentService.deleteAppointment(appointment.id)
                              .subscribe((resp: any) => {
                                if(resp.ok){
                                  this.loaderService.closeLineLoader();
                                  this.sendResponse(resp.param.userPhone);
                                }
                              });
      }
    });
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
}
