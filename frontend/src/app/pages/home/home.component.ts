import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  
  userLogged: User;
  aboutToStartAppointments = [];
  reservedAppointments = [];

  constructor(private userService: UserService,
              private appointmentService: AppointmentService) {
    this.userLogged = this.userService.user;
    this.getAppointments();
   }

  ngOnInit(): void {
  }
  getAppointments(){
    // this.appointmentService.getAppointments()
    //                                   .subscribe(resp => {
    //                                     this.reservedAppointments = resp.reservedAppointments;
    //                                     this.aboutToStartAppointments = resp.aboutToStartAppointments;
    //                                   });
  }
}
