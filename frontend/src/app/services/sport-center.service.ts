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
}
