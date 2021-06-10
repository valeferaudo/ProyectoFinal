import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Field } from 'src/app/models/field.model';
import { SportCenter } from 'src/app/models/sportCenter.model';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  searchText: string = '';
  filterON: boolean = false;
  fields: Field [] = [];
  sportCenters: SportCenter [] = [];
  userLogged : User;

  constructor(private loaderService: LoaderService,
              private searchService: SearchService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private errorService: ErrorsService,) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.searchText = params.search;
      if(params['search'] === undefined){
        this.router.navigateByUrl('/user/home')
      }
      if(this.searchText !== ''){
        this.search();
      }
      else{
        this.router.navigateByUrl('/user/home')
      }
    });
  }
  search(){
    this.filterON = true;
    this.loaderService.openLineLoader();
    this.searchService.getServices(this.searchText)
                  .subscribe((resp: any) => {
                    this.loaderService.closeLineLoader();
                    if(resp.ok){
                      this.sportCenters = resp.param.sportCenters;
                      this.fields = resp.param.fields;
                      this.filterON = false;
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
