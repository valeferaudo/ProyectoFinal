import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from '../../services/errors.service';
import { FieldService } from '../../services/field.service'

@Component({
  selector: 'app-fields',
  templateUrl: './fields.component.html',
  styleUrls: ['./fields.component.css']
})
export class FieldsComponent implements OnInit {

  fields = [];
  param: string;
  query = '';
  empty = true;
  user: User;

  constructor(private fieldService: FieldService,
              private activatedRoute: ActivatedRoute,
              private errorService: ErrorsService) {
              }

   ngOnInit(): void {
     this.activatedRoute.queryParams.subscribe((param: {search: string}) => {
        this.query = param.search || '';
        this.getFields();
       });
    }

    getFields(){
      if (this.query === ''){
        this.param = 'Todas';
      }else{
        this.param = this.query;
      }

      this.fieldService.getFields({})
                            .subscribe((resp: any) => {
                              this.fields = resp;
                              if (this.fields.length === 0){
                                this.empty = true;
                              }else{
                                this.empty = false;
                              }
                            }, err => {
                              console.log(err);
                              this.errorService.showErrors('mejorar',99)
                            });
     }

}
