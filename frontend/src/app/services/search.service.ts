import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const baseUrl = environment.base_url;


@Injectable({
  providedIn: 'root'
})
export class SearchService {
  registerPerPage = '1';

  constructor(private http: HttpClient) { }

  getServices(searchText,page){
    let params = new HttpParams();
    params = params.append('page',`${page}`);
    params = params.append('registerPerPage',this.registerPerPage);
    return this.http.get(`${baseUrl}/search/${searchText}`,{params});
  }}
