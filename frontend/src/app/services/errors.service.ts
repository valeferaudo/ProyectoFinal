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
        this.errorTitle="Acceso denegado";
        this.errorMsg="El usuario no tiene los permisos para acceder";
        break;
      case 2:
          this.errorTitle="Usuario no registrado";
          this.errorMsg="Por favor, ingrese nuevamente los datos";
          break;
      case 3:
        this.errorTitle="No se encontraron resultados";
        this.errorMsg="Por favor, ingrese nuevamente los datos";
        break;
      case 4:
        this.errorTitle="Ya existe un usuario con ese mail";
        this.errorMsg="Por favor, ingrese un nuevo mail";
        break;
      case 5:
        this.errorTitle='Acción prohibida';
        this.errorMsg='El usuario no tiene los permisos para acceder';
        break;
      case 6:
        this.errorTitle='Error al bloquear';
        this.errorMsg='Ya se encuentra bloqueado';
        break;
      case 7:
        this.errorTitle='Error al activar';
        this.errorMsg='Ya se encuentra activado';
        break;
      case 8:
        this.errorTitle='Acción incorrecta';
        this.errorMsg='Este tipo de usuario no tiene que ser activado';
        break;
      case 9:
        this.errorTitle='La contraseña anterior es incorrecta';
        this.errorMsg='Por favor, ingrésela nuevamente';
        break;
      case 10:
        this.errorTitle='El nombre indicado ya se encuentra en uso';
        this.errorMsg='Por favor, ingrese uno distinto';
        break;
      case 11:
        this.errorTitle='Las nuevas contraseñas son distintas';
        this.errorMsg='Por favor, ingréselas nuevamente';
        break;
      case 12:
        this.errorTitle='Acción prohibida';
        this.errorMsg='Por políticas del negocio no se puede cancelar un turno 12hs antes';
        break;
      case 13:
        this.errorTitle='Acción incorrecta';
        this.errorMsg='Sólo Centros deportivos y canchas pueden tener imágenes';
        break;
      case 14:
        this.errorTitle='No existe el archivo';
        this.errorMsg='';
        break;
      case 15:
        this.errorTitle='La extención del archivo es incorrecta';
        this.errorMsg='Por favor, intente cargar una archivo de tipo .png .jpg .jpeg';
        break;
      case 16:
        this.errorTitle='Error al subir la imagen';
        this.errorMsg='Por favor, intente nuevamente';
        break;
      case 17:
        this.errorTitle='Las proporciones de altura y ancho de la imagen son inválidas';
        this.errorMsg='Por favor, intente cargar una imagen de proporciones cuadradas';
        break;
      case 18:
        this.errorTitle='Acción prohibida';
        this.errorMsg='El usuario solo puede eliminar turnos generados por él';
        break;
      case 19:
        this.errorTitle='Error al generar un pago';
        this.errorMsg='Por favor, intente nuevamente';
        break;
      case 20:
        this.errorTitle='Registro no encontrado';
        this.errorMsg='El pago no fue encontrado';
        break;
      case 21:
        this.errorTitle='Turno cancelado';
        this.errorMsg='El turno fue cancelado anteriormente';
        break;
      case 22:
        this.errorTitle='Email y/o contraseña incorrectos';
        this.errorMsg='Por favor, ingrese los datos nuevamente';
        break;
      case 23:
        this.errorTitle='Email incorrecto';
        this.errorMsg='Por favor, ingrese los datos nuevamente';
        break;
      case 24:
        this.errorTitle='Centro deportivo bloqueado';
        this.errorMsg='No se puede activar una cancha de un centro deportivo bloqueado.';
        break;


      case 95:
        this.errorTitle= 'Error al obtener el ruta';
        this.errorMsg= 'Si el error persiste, comuníquese con soporte';
        break;
      case 96:
        this.errorTitle= 'Error al obtener el clima';
        this.errorMsg= 'Si el error persiste, comuníquese con soporte';
        break;
      case 97:
        this.errorTitle='Error de autenticación';
        this.errorMsg='No hay token en la petición';
        break;
      case 98:
        this.errorTitle='Error de autenticación';
        this.errorMsg='El token es incorrecto/caducó';
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
