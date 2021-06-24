import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { DatesForm } from '../interfaces/datesForm.interface';
import { AppointmentFilter } from '../interfaces/filters/appointmentFilter.interface';
import { environment } from 'src/environments/environment';
import { AppointmentTableFilter } from '../interfaces/filters/appointmentTableFilter.Interface';

const baseUrl = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  registerPerPage = '6';

  constructor(private http: HttpClient) { }

  getAvailableAppointments(filterObject: AppointmentFilter){
      let params = new HttpParams();
      params = params.append('sinceDate', filterObject.sinceDate);
      params = params.append('untilDate', filterObject.untilDate);
      params = params.append('sinceHour', filterObject.sinceHour);
      params = params.append('untilHour', filterObject.untilHour);
      return this.http.get(`${baseUrl}/appointments/available/${filterObject.fieldID}`, { params })
  }
  createAppointments(appointment){
      return this.http.post(`${baseUrl}/appointments`, appointment);
  }
  getSportCenterAppointments(sportCenterID: string, filterObject: AppointmentTableFilter,page){
    let params = new HttpParams();
    params = params.append('state', `${filterObject.state}`);
    params = params.append('sinceDate', filterObject.sinceDate);
    params = params.append('untilDate', filterObject.untilDate);
    params = params.append('sinceHour', filterObject.sinceHour);
    params = params.append('untilHour', filterObject.untilHour);
    params = params.append('fieldID', filterObject.fieldID);
    params = params.append('page',`${page}`);
    params = params.append('registerPerPage',this.registerPerPage);
    return this.http.get(`${baseUrl}/appointments/sportCenter/${sportCenterID}`,{params})
  }
  getUserAppointments(userID: string, filterObject: AppointmentTableFilter,page){
    let params = new HttpParams();
    params = params.append('state', `${filterObject.state}`);
    params = params.append('sinceDate', filterObject.sinceDate);
    params = params.append('untilDate', filterObject.untilDate);
    params = params.append('sinceHour', filterObject.sinceHour);
    params = params.append('untilHour', filterObject.untilHour);
    params = params.append('fieldID', filterObject.fieldID);
    params = params.append('page',`${page}`);
    params = params.append('registerPerPage',this.registerPerPage);
    return this.http.get(`${baseUrl}/appointments/user/${userID}`,{params})
  }
  deleteAppointment(id: string){
      return this.http.delete(`${baseUrl}/appointments/${id}`);
  }
}
