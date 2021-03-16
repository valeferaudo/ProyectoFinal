import { Component, OnInit } from '@angular/core';
import { AppointmentService } from 'src/app/services/appointment.service';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent {

  reservedAppointments = [];
  completedAppointments = [];
  inProgressAppointments = [];
  aboutToStartAppointments = [];

  constructor(private appointmentService: AppointmentService) {
      this.getAppointments()
  }
  getAppointments(){
    this.appointmentService.getAppointments()
                                      .subscribe(resp => {
                                        this.reservedAppointments = resp.reservedAppointments;
                                        this.completedAppointments = resp.completedAppointments;
                                        this.inProgressAppointments = resp.inProgressAppointments;
                                        this.aboutToStartAppointments = resp.aboutToStartAppointments;
                                      });
  }
}
