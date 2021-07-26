import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Field } from '../models/field.model';
import { FieldForm } from '../interfaces/fieldForm.inteface';
import { FieldFilter } from '../interfaces/filters/fieldFilter.interface';
import { environment } from 'src/environments/environment';

const baseUrl = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class FieldService {
  registerPerPage = '6';
  constructor(private http: HttpClient) { }
  getField(id: string){
    return this.http.get(`${baseUrl}/fields/${id}`)
  }
  getFields(filters: FieldFilter, page: number){
    let params = new HttpParams();
    params = params.append('text',filters.text);
    params = params.append('state',filters.state);
    params = params.append('sportCenterID',filters.sportCenterID);
    params = params.append('sinceHour',filters.sinceHour);
    params = params.append('untilHour',filters.untilHour);
    params = params.append('sincePrice',filters.sincePrice);
    params = params.append('untilPrice',filters.untilPrice);
    params = params.append('available',`${filters.available}`);
    params = params.append('page',`${page}`);
    params = params.append('registerPerPage',this.registerPerPage);
    if(filters.features.length > 0){
      filters.features.forEach(element => {
        params = params.append('feature',`${element}`)
      });
    }
    if(filters.sports.length > 0){
      filters.sports.forEach(element => {
        params = params.append('sport',`${element}`)
      });
    }
    if(filters.days.length > 0){
      params = params.append('day',`${filters.days}`)
    }
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
  getPriceHistorial(fieldID){
    return this.http.get(`${baseUrl}/fields/priceHistorial/${fieldID}`);
  }
  checkRoofed(fieldID: string){
    return this.http.get(`${baseUrl}/fields/roofed/${fieldID}`);
  }
}
