import { Component, OnInit } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
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
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {

  userLogged: User;
  hiddenSportCenterModal: boolean = false;
  aboutToStartAppointments = [];
  reservedAppointments = [];
  filterReservedON : boolean = false;
  filterAboutToStartON: boolean = false;
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
  doNotCloseMenu = (event) => event.stopPropagation();
  page = 1;
  perHourWeatherON = false;
  todayWeatherON = false;
  today = new Date()
  days = ["Lunes","Martes",'Miércoles','Jueves','Viernes','Sábado','Domingo']
  todayWeather: CurrentWeather;
  perHourWeather = [];
  weatherError = false;
  constructor(private userService: UserService,
              private appointmentService: AppointmentService,
              private loaderService: LoaderService,
              private _config: NgbCarouselConfig,
              private weatherService: WeatherService,
              private errorService: ErrorsService) {}

  ngOnInit(): void {
    this.setConfig();
    this.getUserLogged();
    this.getAppointments();
    // this.getCurrentWeather();
    // this.getPerHourWeather();
  }
  getUserLogged(){
    this.userLogged = this.userService.user;
    this.createSportCenter();
  }
  createSportCenter(){
    if(this.userLogged.role === 'CENTER-SUPER-ADMIN'){
      if(this.userLogged.sportCenter === undefined || this.userLogged.sportCenter === null){
        this.hiddenSportCenterModal=true;
      }
    }
  }
  closeSportCenterModal(closeModal){
    this.hiddenSportCenterModal = closeModal
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
                                        this.errorService.showServerError()
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
                                        this.errorService.showServerError()
                                        this.loaderService.closeLineLoader();
                                      });
  }
  setConfig(){
    this._config.interval =  3000;
    this._config.pauseOnHover = true;
  }
  getCurrentWeather(){
    this.weatherService.getCurrentWeather()
            .subscribe((resp: any)=>{
              this.todayWeather = resp;
              this.todayWeatherON = true;
            },(err) =>{
              console.log(err)
              // this.errorService.showServerError()
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
                // this.errorService.showServerError()
                this.weatherError = true;
              });
  }
  formatDate(date){
    return new Date(date)
  }
}
