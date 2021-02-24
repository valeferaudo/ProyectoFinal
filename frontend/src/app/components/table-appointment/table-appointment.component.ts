import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Appointment } from 'src/app/models/appointment.model';
import { User } from 'src/app/models/user.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ErrorsService } from 'src/app/services/errors.service';
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
  user: User;

  constructor(private userService: UserService,
              private appointmentService: AppointmentService,
              private router: Router,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) {
    this.user = this.userService.user;
  }

  ngOnInit(): void {
  }
  deleteAppointment(id: string){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Cancelar el turno?',
      text: ``,
      icon: 'question',
    }).then((result) => {
      if (result.value) {
        this.appointmentService.deleteAppointment(id)
                              .subscribe(resp => {
                                this.sweetAlertService.showSwalResponse({
                                  title: 'Turno cancelado',
                                  text:'',
                                  icon: 'error',

                                })
                                setTimeout(() => {
                                  location.reload();
                                }, 2000);
                              });
      }
    });
  }

}
