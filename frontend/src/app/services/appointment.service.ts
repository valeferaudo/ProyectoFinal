import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { DatesForm } from '../interfaces/datesForm.interface';
import { AppointmentFilter } from '../interfaces/filters/appointmentFilter.interface';
import { environment } from 'src/environments/environment';

const baseUrl = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor(private http: HttpClient) { }

  getAppointments(){
        return this.http.get(`${baseUrl}/appointments/user`)
  }
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

  deleteAppointment(id: string){
      return this.http.delete(`${baseUrl}/appointments/${id}`);
  }
}
