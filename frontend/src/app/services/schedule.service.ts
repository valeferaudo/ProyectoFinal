import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const baseUrl = environment.base_url

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private http: HttpClient) { }

  getCombo(){
    return this.http.get(`${baseUrl}/schedules/combo`);
  }
  getSpecialSchedules(sportCenterID){
    return this.http.get(`${baseUrl}/schedules/special/${sportCenterID}`);
  }
  createSpecialSchedule(sportCenterID,schedule){
    return this.http.post(`${baseUrl}/schedules/special/${sportCenterID}`,schedule);

  }
  deleteSpecialSchedule(scheduleID){
    return this.http.delete(`${baseUrl}/schedules/special/delete/${scheduleID}`);

  }
}
