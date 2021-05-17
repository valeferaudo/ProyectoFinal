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
  getSportCenterAppointments(sportCenterID: string, filterObject: AppointmentTableFilter){
    let params = new HttpParams();
    params = params.append('reserved', `${filterObject.stateReserved}`);
    params = params.append('aboutToStart', `${filterObject.stateAboutToStart}`);
    params = params.append('inProgress', `${filterObject.stateInProgress}`);
    params = params.append('completed', `${filterObject.stateCompleted}`);
    params = params.append('sinceDate', filterObject.sinceDate);
    params = params.append('untilDate', filterObject.untilDate);
    params = params.append('sinceHour', filterObject.sinceHour);
    params = params.append('untilHour', filterObject.untilHour);
    params = params.append('fieldID', filterObject.fieldID);
    return this.http.get(`${baseUrl}/appointments/sportCenter/${sportCenterID}`,{params})
  }
  getUserAppointments(){
    return this.http.get(`${baseUrl}/appointments/user`)
  }
  //no se si se usa
  deleteAppointment(id: string){
      return this.http.delete(`${baseUrl}/appointments/${id}`);
  }
}
