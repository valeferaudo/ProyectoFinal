import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {



  constructor() { }
  passEqual(pass1: string, pass2: string){
    return(formGroup: FormGroup) => {
      const pass1Control = formGroup.controls[pass1];
      const pass2Control = formGroup.controls[pass2];
      if (pass1Control.value === pass2Control.value){
        pass2Control.setErrors(null);
      }else{
        pass2Control.setErrors({notEqual: true});
      }
    };
  }
  hoursOk(initHour: string, untilHour: string){
    return(FormGroup: FormGroup) =>{
      const initControl = FormGroup.controls[initHour];
      const untilControl = FormGroup.controls[untilHour];
      if(initControl.value !== null && untilControl.value !== null ){
        const init = parseInt((initControl.value).split(':').join(''), 10);
        const until = parseInt((untilControl.value).split(':').join(''), 10);
        if(init <= until){
          untilControl.setErrors(null)
        }else{
          untilControl.setErrors({notOk:true})
        }
      }
    }
  }
}
