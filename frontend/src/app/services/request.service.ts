import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Request } from '../models/request.model';

const baseUrl = environment.base_url

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor(private http: HttpClient) { }

  getSportCenterRequests(sportCenterID){
    // let params = new HttpParams();
    // params = params.append('text',filters.text);
    // params = params.append('state',filters.state);
    // params = params.append('sportCenterID',filters.sportCenterID);
    // return this.http.get(`${baseUrl}/requests/:id` ,{params});
    return this.http.get(`${baseUrl}/requests/${sportCenterID}`);
  }
  getRequests(){
    // let params = new HttpParams();
    // params = params.append('text',filters.text);
    // params = params.append('state',filters.state);
    // params = params.append('sportCenterID',filters.sportCenterID);
    // return this.http.get(`${baseUrl}/requests/:id` ,{params});
    return this.http.get(`${baseUrl}/requests/`);
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
