import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import { ErrorsService } from './errors.service';
import { SweetAlertService } from './sweet-alert.service';


const baseUrl = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class UploadFileService {
  constructor(private http: HttpClient,
              private errorService: ErrorsService,
              private sweetAlertService: SweetAlertService) { }

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
      const url = `${baseUrl}/uploads/${type}/${id}`;
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
        //PONER QUE EL ERROR ES EN LA SUBA DE IMÁGENES PERO QUE LA CANCHA SE EDITO O CREÓ
        console.log(data.msg)
        this.errorService.showErrors(99,'nada');
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  deleteImage(idImage, id, type : 'sportCenter'|'field'){
    let params = new HttpParams();
    return this.http.put(`${baseUrl}/uploads/delete/${type}/${id}/${idImage}`,{params});
  }
}
