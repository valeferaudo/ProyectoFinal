import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {

  @Input() hiddenModal: boolean;
  @Output() closeModal = new EventEmitter<any>();
  userLogged: User;

  constructor(private userService: UserService,
              private loaderService: LoaderService,
              private errorService: ErrorsService,
              private sweetAlertService: SweetAlertService) { }

  ngOnInit(): void {
    this.userLogged = this.userService.user;
  }
  closedModal(){
    this.closeModal.emit()
  }
  paymentSlideChange(event: MatSlideToggle){
    this.loaderService.openLineLoader();
    this.userService.changeNotification('nonPayment',event.checked)
                .subscribe((resp: any) =>{
                  this.loaderService.closeLineLoader();
                  if(resp.ok){
                    this.userLogged = resp.param.user;
                    this.userService.user = resp.param.user;
                    this.sweetAlertService.showSwalResponse({
                      title: event.checked ? 'Notificación activada': 'Notificación desactivada',
                      text:'',
                      icon: 'success'
                    })
                  }
                },(err) => {
                  console.log(err);
                  this.loaderService.closeLineLoader();
                  this.errorService.showErrors(err.error.code,err.error.msg);
                })
  }
  debtSlideChange(event: MatSlideToggle){
    this.loaderService.openLineLoader();
    this.userService.changeNotification('debt',event.checked)
                .subscribe((resp: any) =>{
                  this.loaderService.closeLineLoader();
                  if(resp.ok){
                    this.userLogged = resp.param.user;  
                    this.userService.user = resp.param.user;
                    this.sweetAlertService.showSwalResponse({
                      title: event.checked ? 'Notificación activada': 'Notificación desactivada',
                      text:'',
                      icon: 'success'
                    })
                  }
                },(err) => {
                  console.log(err);
                  this.loaderService.closeLineLoader();
                  this.errorService.showErrors(err.error.code,err.error.msg);
                })  }
}
