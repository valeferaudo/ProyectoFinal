import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('x-token') || '';
    const headers = new HttpHeaders({
      'x-token': token
    });
    const reqClone = req.clone({
      headers
    })
    return next.handle(reqClone);

  //   return next.handle(reqClone).pipe(
  //     catchError(this.handleError)
  //   )
  // }

  // handleError(err: HttpErrorResponse){
  //   console.log(err)
  //   return throwError('manejando error en interceptor')
  // }    
  }
}
