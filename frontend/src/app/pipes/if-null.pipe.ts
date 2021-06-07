import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ifNull'
})
export class IfNullPipe implements PipeTransform {

  transform(text: string ): string {
    if ( text === null || text === undefined || text === ''){
      return '-Sin Datos-';
    }
    else{
      return text
    }
  }

}
