import { Component, OnInit } from '@angular/core';
import { Field } from 'src/app/models/field.model';
import { SportCenter } from 'src/app/models/sportCenter.model';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {

  searchText: string = '';
  fields: Field [] = [];
  sportCenters: SportCenter [] = [];
  userLogged : User;

  constructor(private userService: UserService,
              private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService,
              private errorService: ErrorsService) { }

  ngOnInit(): void {
    this.userLogged = this.userService.user;
    this.getFavorites();
  }
  getFavorites(){
    this.loaderService.openLineLoader();
    this.userService.getFavorites()
                  .subscribe((resp: any)=>{
                    this.loaderService.closeLineLoader();
                    if(resp.ok){
                      this.fields = resp.param.fields;
                      this.sportCenters = resp.param.sportCenters;
                    }
                  },(err)=>{
                    console.log(err);
                    this.loaderService.closeLineLoader();
                    this.errorService.showErrors(99,'nada');
                  })
  }
  removeFavoriteFromArray(item){
    for (let j = 0; j < this.fields.length; j++) {
      if(this.fields[j].id === item){
        this.fields.splice(j,1)
      }
    }
    for (let i = 0; i < this.sportCenters.length; i++) {
      if(this.sportCenters[i].id === item){
        this.sportCenters.splice(i,1)
      }
    }
  }
}
