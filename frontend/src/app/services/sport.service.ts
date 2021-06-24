import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SportFilter } from '../interfaces/filters/sportFilter.interface';
import { Sport } from '../models/sport.model';

const baseUrl = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class SportService {
  registerPerPage = '6';
  constructor(private http: HttpClient) { }

  getSports( filters: SportFilter,page){
    let params = new HttpParams();
    params = params.append('text',filters.text);
    params = params.append('state',filters.state);
    params = params.append('page',`${page}`);
    params = params.append('registerPerPage',this.registerPerPage);
    return this.http.get(`${baseUrl}/sports/` ,{params});
  }
  getSport(id: string){

  }
  createSport(sport: Sport){
    return this.http.post(`${baseUrl}/sports/`,sport);
  }
  updateSport(id:string, sport: Sport){
    return this.http.put(`${baseUrl}/sports/${id}`,sport);
  }
  acceptBlockSport(id, action){
    let body = {
      action: action
    };
    return this.http.put(`${baseUrl}/sports/activatetBlock/${id}`,body);
  }
  getSportCombo(){
    return this.http.get(`${baseUrl}/sports/combo`);
  }
}
