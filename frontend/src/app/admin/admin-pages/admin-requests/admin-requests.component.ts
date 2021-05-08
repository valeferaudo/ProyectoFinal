import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Request } from 'src/app/models/request.model';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { RequestService } from 'src/app/services/request.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-admin-requests',
  templateUrl: './admin-requests.component.html',
  styleUrls: ['./admin-requests.component.css']
})
export class AdminRequestsComponent implements OnInit {

  requestForm: FormGroup;
  userLogged: User;
  requestObject: Request;
  requests: Request [] = []

  constructor(private fb: FormBuilder,
              private sweetAlertService: SweetAlertService,
              private userService: UserService,
              private errorService: ErrorsService,
              private requestService: RequestService,
              private loaderService: LoaderService) { }

  ngOnInit(): void {
    this.userLogged = this.userService.user;
    this.createRequestForm();
    this.getRequests()
  }
  createRequestForm(){
    this.requestForm = this.fb.group({
      section: ['',[Validators.required]],
      description:['', [Validators.required]]
    })
  }
  sendRequest(){
    if (this.requestForm.invalid){
      Object.values(this.requestForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Enviar solicitud?',
      text: ``,
      icon: 'question',
    })
    .then((result) => {
      if (result.value) {
            this.loaderService.openLineLoader();
            this.requestService.createRequest(this.createRequestObject())
                    .subscribe((resp: any) => {
                      if(resp.ok){
                        this.sweetAlertService.showSwalResponse({
                          title: 'Solicitud enviada',
                          text:'',
                          icon: 'success',
                        })
                        this.loaderService.closeLineLoader();
                        this.getRequests();
                      }
                    }, (err) => {
                      console.log(err)
                      this.loaderService.closeLineLoader();
                      this.errorService.showErrors('nada',99)
                    });
      }
    })
  }
  getFieldValid(field: string){
    return this.requestForm.get(field).invalid &&
            this.requestForm.get(field).touched;
 }
 createRequestObject(){
  let request: Request = {
    section: this.requestForm.controls['section'].value,
    description: this.requestForm.controls['description'].value,
    sportCenter: this.userLogged.sportCenter.id,
    creatorEmail: this.userLogged.email
  }
  return request
 }
 getRequests(){
  this.loaderService.openLineLoader();
  this.requestService.getSportCenterRequests(this.userLogged.sportCenter.id)
            .subscribe((resp:any)=>{
              if(resp.ok){
                this.loaderService.closeLineLoader();
                this.requests = resp.param.requests;
              }
            }, (err) => {
              console.log(err)
              this.loaderService.closeLineLoader();
              this.errorService.showErrors('nada',99)
            });
 }
}
