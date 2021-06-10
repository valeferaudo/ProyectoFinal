import { Component, OnInit } from '@angular/core';
import { AppointmentTableFilter } from 'src/app/interfaces/filters/appointmentTableFilter.Interface';
import { User } from 'src/app/models/user.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
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
  filterObjectReserved: AppointmentTableFilter = {
    state: 'Reserved',
    sinceDate: null,
    untilDate: null,
    sinceHour: 0,
    untilHour: 23,
    fieldID: null
  }
  filterObjectAboutToStart: AppointmentTableFilter = {
    state: 'AboutToStart',
    sinceDate: null,
    untilDate: null,
    sinceHour: 0,
    untilHour: 23,
    fieldID: null
  }
  filterReservedON : boolean = false;
  filterAboutToStartON: boolean = false;
  constructor(private userService: UserService,
              private appointmentService: AppointmentService,
              private loaderService: LoaderService,
              private errorService: ErrorsService) {
    this.userLogged = this.userService.user;
    this.getAppointments();
   }

  ngOnInit(): void {
  }
  getAppointments(){
    this.getReservedAppointments();

  }
  getReservedAppointments(){
    this.loaderService.openLineLoader();
    this.appointmentService.getUserAppointments(this.userLogged.uid,this.filterObjectReserved)
                                      .subscribe((resp:any) => {
                                        this.loaderService.closeLineLoader();
                                        if(resp.ok){
                                          this.reservedAppointments= resp.param.appointments;
                                          this.filterReservedON = true 
                                        }
                                      }, (err) =>{
                                        console.log(err)
                                        this.errorService.showServerError()
                                        this.loaderService.closeLineLoader();
                                      });
  }
  getAboutToStartAppointments(){
    this.loaderService.openLineLoader();
    this.appointmentService.getUserAppointments(this.userLogged.uid,this.filterObjectAboutToStart)
                                      .subscribe((resp:any) => {
                                        this.loaderService.closeLineLoader();
                                        if(resp.ok){
                                          this.aboutToStartAppointments= resp.param.appointments
                                          this.filterAboutToStartON = true;
                                        }
                                      }, (err) =>{
                                        console.log(err)
                                        this.errorService.showServerError()
                                        this.loaderService.closeLineLoader();
                                      });
  }
}
