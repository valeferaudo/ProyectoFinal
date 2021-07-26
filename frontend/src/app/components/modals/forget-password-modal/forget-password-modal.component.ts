import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorsService } from 'src/app/services/errors.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-forget-password-modal',
  templateUrl: './forget-password-modal.component.html',
  styleUrls: ['./forget-password-modal.component.css']
})
export class ForgetPasswordModalComponent implements OnInit {

  @Input() hiddenEmailModal: boolean;
  emailForm: FormGroup;
  @Output() closeModalOutput: EventEmitter<boolean>;

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private errorService: ErrorsService,
              private loaderService: LoaderService,
              private sweetAlertService: SweetAlertService) {
                this.closeModalOutput = new EventEmitter(); 
                this.createEmailForm()
   }

  ngOnInit(): void {
  }

  createEmailForm(){
    this.emailForm = this.fb.group({
      email:["",[Validators.required,Validators.email],]
    })
  }

  closeModal(){
    this.hiddenEmailModal= false;
    this.closeModalOutput.emit(this.hiddenEmailModal)
  }
  sendEmail(){
    if (this.emailForm.invalid){
      Object.values(this.emailForm.controls).forEach(control=>{
        control.markAsTouched();
      })
      return;
    }
    this.loaderService.openLineLoader();
    this.userService.recoverPassword(this.emailForm.value)
                    .subscribe((resp: any) => {
                       if (resp.ok === true){
                         this.loaderService.closeLineLoader();
                         this.sweetAlertService.showSwalResponse({
                           title: 'Mail enviado',
                           text:'Por favor, revise su casilla de correo electrónico',
                           icon: "success"
                         })
                        this.closeModal();
                       }
                    }, (err) => {
                      console.log(err)
                      this.errorService.showErrors(err.error.code,err.error.msg);
                      this.loaderService.closeLineLoader();
                    })
  }
  getFieldValid(field : string){
    return this.emailForm.get(field).invalid &&
            this.emailForm.get(field).touched
 }

}
