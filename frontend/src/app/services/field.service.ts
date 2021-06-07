import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Field } from '../models/field.model';
import { FieldForm } from '../interfaces/fieldForm.inteface';
import { FieldFilter } from '../interfaces/filters/fieldFilter.interface';
import { environment } from 'src/environments/environment';

const baseUrl = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class FieldService {

  constructor(private http: HttpClient) { }
  getField(id: string){
    return this.http.get(`${baseUrl}/fields/${id}`)
  }
  getFields(filters: FieldFilter){
    let params = new HttpParams();
    params = params.append('text',filters.text);
    params = params.append('state',filters.state);
    params = params.append('sportCenterID',filters.sportCenterID);
    return this.http.get(`${baseUrl}/fields/` ,{params});
  }
  activateBlockField(id, action){
    let body = {
      action: action
    };
    return this.http.put(`${baseUrl}/fields/activateBlock/${id}`,body);
  }
  createField(field: Field ){
    return this.http.post(`${baseUrl}/fields/`, field );
  }
  updateField(id, form: FieldForm){
    let fieldObject = form;
    return this.http.put(`${baseUrl}/fields/${id}`, fieldObject );
  }
  updateFieldSport(fieldID,fieldSport){
    return this.http.put(`${baseUrl}/fields/sport/${fieldID}`, fieldSport );
  }
  getFieldCombo(sportCenterID: string){
    let params = new HttpParams();
    params = params.append('sportCenterID',sportCenterID);
    return this.http.get(`${baseUrl}/fields/combo`,{params});
  }
  getMinMaxPrices(){
    return this.http.get(`${baseUrl}/fields/minMaxPrices`);
  }
}
