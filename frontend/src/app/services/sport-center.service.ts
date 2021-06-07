import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { SportCenterFilter } from '../interfaces/filters/sportCenter.interface';

const baseUrl = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class SportCenterService {

  constructor(private http: HttpClient) {}

  getSportCenters(filters: SportCenterFilter){
    let params = new HttpParams();
    params = params.append('text',filters.text);
    params = params.append('state',filters.state);
    params = params.append('sinceHour',filters.sinceHour);
    params = params.append('untilHour',filters.untilHour);
    if(filters.services.length > 0){
      filters.services.forEach(element => {
        params = params.append('service',`${element}`)
      });
    }
    if(filters.sports.length > 0){
      filters.sports.forEach(element => {
        params = params.append('sport',`${element}`)
      });
    }
    if(filters.days.length > 0){
      filters.days.forEach(element => {
        params = params.append('day',`${element}`)
      });
    }
    return this.http.get(`${baseUrl}/sportcenters/`,{params});
  }
  getSportCenter(sportCenterID: string){
    return this.http.get(`${baseUrl}/sportcenters/${sportCenterID}`);
  }
  createSportCenter(dataForm){
    return this.http.post(`${baseUrl}/sportcenters/`, dataForm );
  }
  activateBlockSportCenter(id, action){
    let body = {
      action: action
    };
    return this.http.put(`${baseUrl}/sportcenters/activateBlock/${id}`,body);
  }
  updateSportCenter(id, data){
    return this.http.put(`${baseUrl}/sportcenters/${id}`, data);
  }
  updateSchedule(id, data){
    return this.http.put(`${baseUrl}/sportcenters/schedule/${id}`, data);
  }
  updateServices(id, data){
    return this.http.put(`${baseUrl}/sportcenters/services/${id}`, data);
  }
}
