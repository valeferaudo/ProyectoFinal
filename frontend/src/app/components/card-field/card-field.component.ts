import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { ErrorsService } from '../../services/errors.service';
import { FieldService } from '../..//services/field.service';
import { UserService } from '../../services/user.service';
import { SweetAlertService } from '../../services/sweet-alert.service';
@Component({
  selector: 'app-card-field',
  templateUrl: './card-field.component.html',
  styleUrls: ['./card-field.component.css']
})
export class CardFieldComponent {
  @Input() field: any ={}
  @Input() id: any;
  user: User;

  constructor(private router: Router,
              private userService: UserService,
              private fieldService: FieldService,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) {
                this.user = this.userService.user;
               }

  navigateField(id){
    if (this.user.role === 'USER'){
      this.router.navigateByUrl(`/appointment/${id}`);
    }
    else if (this.user.role === 'CENTER-ADMIN'){
      this.router.navigateByUrl(`/admin/appointment/${id}`);
    }

  }
  updateField(id: string){
    this.router.navigateByUrl(`/admin/field/${id}`);
  }
  deleteField(id: string){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Estás seguro de eliminar la cancha?',
      text: `Cancha: ${this.field.name}`,
      icon: 'question',
    }).then((result) => {
      if (result.value) {
        this.fieldService.deleteField(id)
                            .subscribe(resp => {
                              this.sweetAlertService.showSwalResponse({
                                title: 'Cancha eliminada',
                                text:'',
                                icon: 'error',
                              })
                              setTimeout(() => {
                                location.reload();
                              }, 2000);
                              }, (err) => {
                                console.log(err);
                                this.errorService.showErrors('mejorar',99)
                              });

    }
    });
  }

}
