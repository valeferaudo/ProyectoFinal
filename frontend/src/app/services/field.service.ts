import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Field } from '../models/field.model';
import { FieldForm } from '../interfaces/fieldForm.inteface';

@Injectable({
  providedIn: 'root'
})
export class FieldService {

  constructor(private http: HttpClient) { }

  getField(id: string){
    return this.http.get(`http://localhost:3000/api/fields/${id}`)
                    .pipe(map((data: any) => {
                      return data.field;
                    }));
  }
  getFields(search: any){
    const params = new HttpParams().set('search', search);
    return this.http.get(`http://localhost:3000/api/fields`, { params })
                    .pipe(map((data: any) => {
                      return data.fields;
                    }));
  }
  getFieldsByCenterAdmin(search: any, id){
    const params = new HttpParams().set('search', search);
    return this.http.get(`http://localhost:3000/api/fields/admin/${id}`, { params })
                    .pipe(map((data: any) => {
                      return data.fields;
                    }));
  }
  createField(form: FieldForm, uid){
    const body = {
      name: form.name,
      cantMaxPlayers: form.cantMaxPlayers,
      price: form.price,
      openingHour: form.openingHour,
      closingHour: form.closingHour,
      description: form.description,
      user: uid
    };
    return this.http.post(`http://localhost:3000/api/fields`, body);
  }
  deleteField(id: string){
    return this.http.delete(`http://localhost:3000/api/fields/${id}`);
  }
  updateField(id, form: FieldForm){
    const body = {
      name: form.name,
      cantMaxPlayers: form.cantMaxPlayers,
      price: form.price,
      openingHour: form.openingHour,
      closingHour: form.closingHour,
      description: form.description
    };
    return this.http.put(`http://localhost:3000/api/fields/${id}`, body );
  }
}
