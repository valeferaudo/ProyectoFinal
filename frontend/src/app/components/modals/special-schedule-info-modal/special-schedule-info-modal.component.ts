import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-special-schedule-info-modal',
  templateUrl: './special-schedule-info-modal.component.html',
  styleUrls: ['./special-schedule-info-modal.component.css']
})
export class SpecialScheduleInfoModalComponent implements OnInit {

  @Input() hiddenModal: boolean;
  @Output() closeModal = new EventEmitter<string>();
  @Output() openCreateModal = new EventEmitter<string>();
  specialSchedules : any [] = [];
  userLogged: User;

  constructor(private userService: UserService,
              private scheduleService: ScheduleService,
              private sweetAlertService: SweetAlertService,
              private loaderService: LoaderService,
              private errorService: ErrorsService) { }

  ngOnInit(): void {
    this.userLogged = this.userService.user;
    this.getSpecialSchedules();
  }
  closedModal(){
    this.closeModal.emit();
  }
  getSpecialSchedules(){
    this.loaderService.openLineLoader();
    this.scheduleService.getSpecialSchedules(this.userLogged.sportCenter.id)
                      .subscribe((resp:any)=>{
                        this.loaderService.closeLineLoader();
                        if (resp.ok){
                          this.specialSchedules = resp.param.specialSchedules;
                        }
                      }, (err) => {
                        console.log(err)
                          this.loaderService.closeLineLoader();
                          this.errorService.showErrors(err.error.code,err.error.msg);
                        })
  }
  openSpecialScheduleCreateModal(){
    this.openCreateModal.emit();
    this.closedModal();
  }
  deleteSpecialSchedule(specialSchedule){
    this.sweetAlertService.showSwalConfirmation({
      title: '¿Eliminar fecha especial?',
      text: ``,
      icon: 'question'})
    .then((result) => {
      if (result.value) {
        this.loaderService.openLineLoader();
        this.scheduleService.deleteSpecialSchedule(specialSchedule.id)
                        .subscribe((resp: any) =>{
                          this.loaderService.closeLineLoader();
                          if(resp.ok){
                            this.sweetAlertService.showSwalResponse({
                              title: 'Fecha especial eliminada',
                              text:'',
                              icon: 'success'
                            });
                            this.getSpecialSchedules();                   
                          }
                        },(err)=>{
                          console.log(err);
                          this.loaderService.closeLineLoader();
                          this.errorService.showErrors(err.error.code,err.error.msg);
                        })
      }
    })
  }
}
