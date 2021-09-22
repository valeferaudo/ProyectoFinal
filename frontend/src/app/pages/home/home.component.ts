import { Component, OnInit } from '@angular/core';
import { CurrentWeather } from 'src/app/interfaces/currentWeather.interface';
import { AppointmentTableFilter } from 'src/app/interfaces/filters/appointmentTableFilter.Interface';
import { Appointment } from 'src/app/models/appointment.model';
import { User } from 'src/app/models/user.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { UserService } from 'src/app/services/user.service';
import { WeatherService } from 'src/app/services/weather.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  
  hiddenGPSModal: boolean = false;
  hiddenPaymentModal: boolean = false;

  appointmentSelected: Appointment;

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

  //weather
  perHourWeatherON = false;
  todayWeatherON = false;
  today = new Date()
  days = ["Lunes","Martes",'Miércoles','Jueves','Viernes','Sábado','Domingo']
  todayWeather: CurrentWeather;
  perHourWeather = [];
  weatherError = false;
  //PAGINATOR
  page = 1;
  sportCenter: any;
  constructor(private userService: UserService,
              private appointmentService: AppointmentService,
              private loaderService: LoaderService,
              private weatherService: WeatherService,
              private errorService: ErrorsService) {}

  ngOnInit(): void {
    this.userLogged = this.userService.user;
    this.getAppointments();
    this.getCurrentWeather();
    this.getPerHourWeather();
  }
  getAppointments(){
    this.getReservedAppointments();
    this.getAboutToStartAppointments();
  }
  getReservedAppointments(){
    this.loaderService.openLineLoader();
    this.appointmentService.getUserAppointments(this.userLogged.uid,this.filterObjectReserved,this.page)
                                      .subscribe((resp:any) => {
                                        this.loaderService.closeLineLoader();
                                        if(resp.ok){
                                          this.reservedAppointments= resp.param.appointments;
                                          this.filterReservedON = true 
                                        }
                                      }, (err) =>{
                                        console.log(err)
                                        this.errorService.showErrors(err.error.code,err.error.msg);
                                        this.loaderService.closeLineLoader();
                                      });
  }
  getAboutToStartAppointments(){
    this.loaderService.openLineLoader();
    this.appointmentService.getUserAppointments(this.userLogged.uid,this.filterObjectAboutToStart, this.page)
                                      .subscribe((resp:any) => {
                                        this.loaderService.closeLineLoader();
                                        if(resp.ok){
                                          this.aboutToStartAppointments= resp.param.appointments
                                          this.filterAboutToStartON = true;
                                        }
                                      }, (err) =>{
                                        console.log(err)
                                        this.errorService.showErrors(err.error.code,err.error.msg);
                                        this.loaderService.closeLineLoader();
                                      });
  }
  getCurrentWeather(){
    this.weatherService.getCurrentWeather()
            .subscribe((resp: any)=>{
              this.todayWeather = resp;
              this.todayWeatherON = true;
            },(err) =>{
              console.log(err)
              this.errorService.showErrors(96,'');
              this.weatherError = true;
            });
  }
  getPerHourWeather(){
    this.weatherService.getPerHour()
              .subscribe((resp: any)=>{
                this.perHourWeather = resp.list;
                this.perHourWeatherON = true;
              },(err) =>{
                console.log(err)
                this.errorService.showErrors(96,'');
                this.weatherError = true;
              });
  }
  formatDate(date){
    return new Date(date)
  }
  openGPSModal(appointment){
    this.sportCenter = appointment.sportCenter
    this.hiddenGPSModal = true;
  }
  closeGPSModal(){
    this.hiddenGPSModal = false;
  }
  openPaymentModal(appointment){
    this.appointmentSelected = appointment
    this.hiddenPaymentModal = true;
  }
  closePaymentModal(){
    this.hiddenPaymentModal = false;
  }
}
