import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';


const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class UploadFileService {
  constructor() { }

  // this can be resolve with http request
  async uploadImage(
    files: File [],
    type: 'sportCenter'|'field',
    id: string){
    try {
      const token = localStorage.getItem('token') || '';
      const headers = new HttpHeaders({
        'x-token': token
      });
      const url = `${base_url}/uploads/${type}/${id}`;
      const formData = new FormData();
      if(files.length > 0){
          for (let i = 0; i < files.length; i++) {
            formData.append(`image${i}`, files[i]);            
          }
      }
      else{
        formData.append('image','no-image')
      }
      const resp = await fetch(url, {
        headers: {'x-token': token},
        method: 'PUT',
        body: formData,
      });
      //Desaencapsula la data
      const data = await resp.json();
      if (data.ok){
        return data;
      }
      else{
        console.log(data.msg);
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
