import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {
  errorTitle: string ="";
  errorMsg: string = "";
  constructor() { }

  showErrors(errorCode, errorDescription){
    switch (errorCode) {
      case 1:
        this.errorTitle="Error en algún campo";
        this.errorMsg="Por favor, ingrese nuevamente los datos";
        break;
      case 2:
          this.errorTitle="Email y/o contraseña incorrectos";
          this.errorMsg="Por favor, ingrese nuevamente los datos";
          break;
      case 3:
        this.errorTitle="El email ingresado ya está en uso";
        this.errorMsg="Por favor, ingrese otro email";
        break;
      case 4:
        this.errorTitle="Ha ocurrido un error en la identificación";
        this.errorMsg="Por favor, inténtelo nuevamente";
        break;
      case 5:
        this.errorTitle='Usuario bloqueado';
        this.errorMsg='Por favor, comuníquese con administración';
        break;
      case 6:
        this.errorTitle='El registro que intenta buscar no existe';
        this.errorMsg='Por favor, ingrese nuevamente los datos';
        break;
      case 7:
        this.errorTitle='Error al enviar el email de registro de usuario';
        this.errorMsg='Por favor, inténtelo nuevamente';
        break;
      case 8:
        this.errorTitle='Las contraseñas no coinciden';
        this.errorMsg='Por favor, ingréselas nuevamente';
        break;
      case 9:
        this.errorTitle='La contraseña anterior es incorrecta';
        this.errorMsg='Por favor, ingrésela nuevamente';
        break;
      case 10:
        this.errorTitle='El registro fue eliminado';
        this.errorMsg='';
        break;
      case 11:
        this.errorTitle='Ha ocurrido un error al registrar el ingreso';
        this.errorMsg='Por favor, inténtelo nuevamente';
        break;
      case 12:
        this.errorTitle='El nombre de la carpeta destino de la imagen es inválido';
        this.errorMsg='';
        break;
      case 13:
        this.errorTitle='Las proporciones de altura y ancho de la imagen son inválidas';
        this.errorMsg='Por favor, intente cargar una imagen cuadrada';
        break;
      case 14:
        this.errorTitle='El tipo de archivo es inválido';
        this.errorMsg='Por favor, intente cargar un tipo de archivo válido';
        break;
      case 15:
        this.errorTitle='El tamaño de la imagen es inválido';
        this.errorMsg='Por favor, intente cargar una imagen con ancho y alto mínimo de 400px';
        break;



      case 99:
        this.errorTitle="Error inesperado, comuníquese con soporte"
        this.errorMsg= `Error: ${errorDescription}`
        break;
    
      default:
        this.errorTitle="Error inesperado, comuníquese con soporte"
        this.errorMsg= `Error: ${errorDescription}`
        break;
    }
    Swal.fire({
      title: `${this.errorTitle}`,
      text: `${this.errorMsg}`,
      icon: "error",
    })
  }
  showServerError(){
    Swal.fire({
      title: `ERROR EN EL SERVIDOR`,
      html: `<h2>Por favor, inténtelo nuevamente</h2> <p>En caso de persistir, comuníquese con soporte.</p>`,
      icon: "error",
    })
  }
}
