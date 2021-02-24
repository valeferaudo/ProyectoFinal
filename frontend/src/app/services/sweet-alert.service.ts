import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { ConfirmationSwal } from '../models/confirmationSwal';

@Injectable({
  providedIn: 'root'
})
export class SweetAlertService {

  constructor() { }

  showSwalConfirmation(confirmationSwalObject: ConfirmationSwal){
    return  Swal.fire({
      title: confirmationSwalObject.title,
      text: confirmationSwalObject.text,
      icon: confirmationSwalObject.icon,
      showCancelButton: true,
      confirmButtonColor: '#009846',
      cancelButtonColor: '#D1D1D1',
      cancelButtonText: 'NO',
      confirmButtonText: 'SI'
    })
  }
  showSwalResponse(confirmationSwalObject: ConfirmationSwal){
    return  Swal.fire({
      title: confirmationSwalObject.title,
      text: confirmationSwalObject.text,
      icon: confirmationSwalObject.icon,
      timer: 1000,
      showConfirmButton:false,
      allowOutsideClick: false
    })
  }
  showSwalError(confirmationSwalObject: ConfirmationSwal){
    return  Swal.fire({
      title: confirmationSwalObject.title,
      text: confirmationSwalObject.text,
      icon: confirmationSwalObject.icon,
      showConfirmButton:true,
      allowOutsideClick: true
    })
  }
  showSwalResponseDelay(confirmationSwalObject: ConfirmationSwal){
    return  Swal.fire({
      title: confirmationSwalObject.title,
      text: confirmationSwalObject.text,
      icon: confirmationSwalObject.icon,
      timer: 3000,
      showConfirmButton:false,
      allowOutsideClick: false
    })
  }
}
