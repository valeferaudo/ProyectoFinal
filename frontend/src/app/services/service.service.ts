import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ServiceFilter } from '../interfaces/filters/serviceFilter.interface';
import { Service } from '../models/service.model';

const baseUrl = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  constructor(private http: HttpClient) { }

  getServices(filters: ServiceFilter){
    let params = new HttpParams();
    params = params.append('text',filters.text);
    params = params.append('state',filters.state);
    return this.http.get(`${baseUrl}/services/` ,{params});
  }
  getService(){

  }
  createService(service: Service){
    return this.http.post(`${baseUrl}/services/`,service);

  }
  updateService(id: string, service: Service){
    return this.http.put(`${baseUrl}/services/${id}`,service);
  }
  activeBlockService(id, action){
    let body = {
      action: action
    };
    return this.http.put(`${baseUrl}/services/activateBlock/${id}`,body);
  }
  getServiceCombo(){
    return this.http.get(`${baseUrl}/services/combo`);
  }
}
