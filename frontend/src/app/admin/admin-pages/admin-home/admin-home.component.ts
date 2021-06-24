import { Component, OnInit } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentTableFilter } from 'src/app/interfaces/filters/appointmentTableFilter.Interface';
import { Appointment } from 'src/app/models/appointment.model';
import { User } from 'src/app/models/user.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {

  userLogged: User;
  hiddenSportCenterModal: boolean = false;
  appointments : Appointment [] = []
  filterObject: AppointmentTableFilter = {
    state: 'AboutToStart',
    sinceDate: null,
    untilDate: null,
    sinceHour: 0,
    untilHour: 23,
    fieldID: null
  }
  doNotCloseMenu = (event) => event.stopPropagation();
  page = 1;
  constructor(private userService: UserService,
              private appointmentService: AppointmentService,
              private loaderService: LoaderService,
              private _config: NgbCarouselConfig,
              private errorService: ErrorsService) {}

  ngOnInit(): void {
    this.getUserLogged();
    this.getAboutToStartAppointments();
    this.setConfig();
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
  getAboutToStartAppointments(){
    this.loaderService.openLineLoader();
    this.appointmentService.getSportCenterAppointments(this.userLogged.sportCenter.id,this.filterObject,this.page)
                                      .subscribe((resp:any) => {
                                        this.loaderService.closeLineLoader();
                                        if(resp.ok){
                                          this.appointments= resp.param.appointments
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
}
