import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { DatesForm } from '../interfaces/datesForm.interface';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor(private http: HttpClient) { }

  getAppointments(){
        return this.http.get('http://localhost:3000/api/appointments/user')
                        .pipe(map((data: any) => {
                            return data.appointments;
                          }));
  }
  getAvailableAppointments(form: DatesForm, id: string){
      let params = new HttpParams();
      params = params.append('dateSince', form.sinceDate);
      params = params.append('dateUntil', form.untilDate);
      return this.http.get(`http://localhost:3000/api/appointments/available/${id}`, { params })
                        .pipe(map((data: any) => {
                            return data.available;
                          }));
  }

  createAppointments(appointment){
      return this.http.post('http://localhost:3000/api/appointments', appointment);
  }

  deleteAppointment(id: string){
      return this.http.delete(`http://localhost:3000/api/appointments/${id}`);
  }
}
