import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

const baseUrl = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class SportCenterService {

  constructor(private http: HttpClient) {}

  createSportCenter(dataForm){
    const token = localStorage.getItem('x-token') || '';
    return this.http.post(`${baseUrl}/sportcenters/`, dataForm,{ headers: {'x-token': token}});
  }
}
