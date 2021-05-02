import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FeatureFilter } from '../interfaces/filters/featureFilter.interface';
import { Feature } from '../models/feature.model';

const baseUrl = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class FeatureService {

  constructor (private http: HttpClient) { }

  getFeatures(filters: FeatureFilter){
    let params = new HttpParams();
    params = params.append('text',filters.text);
    params = params.append('state',filters.state);
    return this.http.get(`${baseUrl}/features/`,{params});
  }
  getFeature(){

  }
  createFeature(feature: Feature){
    return this.http.post(`${baseUrl}/features/`,feature);

  }
  updateFeature(id: string, feature: Feature){
    return this.http.put(`${baseUrl}/features/${id}`,feature);
  }
  activeBlockFeature(id, action){
    let body = {
      action: action
    };
    return this.http.put(`${baseUrl}/features/activateBlock/${id}`,body);
  }
}
