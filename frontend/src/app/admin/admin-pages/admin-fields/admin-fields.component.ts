import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { FieldService } from 'src/app/services/field.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-admin-fields',
  templateUrl: './admin-fields.component.html',
  styleUrls: ['./admin-fields.component.css']
})
export class AdminFieldsComponent implements OnInit {

  fields = [];
  param: string;
  query = '';
  empty = true;
  user: User;
  searchInput: any;

  constructor(private fieldService: FieldService,
              private userService: UserService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) {
                this.user = this.userService.user;
                this.activatedRoute.queryParams.subscribe((param: {search: string}) => {
                  this.query = param.search || '';
                  this.getFields();
                 });
                this.getFields();
              }

  ngOnInit(): void {
  }

  getFields(){
    if (this.query === ''){
      this.param = 'Todas';
    }else{
      this.param = this.query;
    }
    this.fieldService.getFieldsByCenterAdmin(this.query, this.user.uid)
                          .subscribe((resp: any) => {
                            this.fields = resp;
                            if (this.fields.length === 0){
                              this.empty = true;
                            }else{
                              this.empty = false;
                            }
                          }, err => {
                            console.log(err);
                            this.errorService.showErrors('error',99)
                            // Swal.fire('Error', 'Intentar nuevamente...', 'error');
                          });
  }
   searchField(text: string){
    this.router.navigate(['/admin/fields'], {queryParams: {search: text},
                                      replaceUrl: true,
                                      queryParamsHandling: 'merge'});
  }

}
