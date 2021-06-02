import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { ErrorsService } from '../../services/errors.service';
import { FieldService } from '../..//services/field.service';
import { UserService } from '../../services/user.service';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { Field } from 'src/app/models/field.model';
@Component({
  selector: 'app-card-field',
  templateUrl: './card-field.component.html',
  styleUrls: ['./card-field.component.css']
})
export class CardFieldComponent {
  @Input() field: Field;
  userLogged: User;

  constructor(private router: Router,
              private userService: UserService,
              private fieldService: FieldService,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) {
                this.userLogged = this.userService.user;
               }

  goAppointment(fieldID){
    //ir a la pagina de turnos ya con la cancha

  }
  goSportCenter(sportCenterID){
    //ABRIR EL MODAL DE INFO DEL CENTRO DEPORTIVO
    // que te muestre un mapa con la ubicacion tambien
  }
  addFavorite(fieldID){
//PONER COMO FAVORITO
  }
  deleteFavorite(fieldID){
    //quitar de favorito
  }
}
