import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { RequestFilter } from '../interfaces/filters/requestFilter.interface';
import { Request } from '../models/request.model';

const baseUrl = environment.base_url

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor(private http: HttpClient) { }

  getSportCenterRequests(sportCenterID,filters: RequestFilter){
    let params = new HttpParams();
    params = params.append('section',filters.section);
    params = params.append('text',filters.text);
    params = params.append('state',filters.state);
    params = params.append('seen',filters.seen);
    return this.http.get(`${baseUrl}/requests/${sportCenterID}` ,{params});
  }
  getRequests(filters: RequestFilter){
    let params = new HttpParams();
    params = params.append('section',filters.section);
    params = params.append('text',filters.text);
    params = params.append('state',filters.state);
    params = params.append('seen',filters.seen);
    return this.http.get(`${baseUrl}/requests/`, {params});
  }
  createRequest(request: Request ){
    return this.http.post(`${baseUrl}/requests/`, request );
  }
  activeBlockRequest(id, action){
    let body = {
      action: action
    };
    return this.http.put(`${baseUrl}/requests/activateBlock/${id}`,body);
  }
  markAsSeen(id){
    return this.http.put(`${baseUrl}/requests/seen/${id}`,{});
  }
}
