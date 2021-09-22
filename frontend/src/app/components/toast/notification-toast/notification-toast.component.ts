import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-notification-toast',
  templateUrl: './notification-toast.component.html',
  styleUrls: ['./notification-toast.component.css']
})
export class NotificationToastComponent implements OnInit {

  @Output() openDebtModal = new EventEmitter<boolean>();
  @Output() openPaymentModal = new EventEmitter<boolean>();

  constructor(public notificationService: NotificationService,
              public userService: UserService,
              private router: Router) { }

  ngOnInit(): void {
  }
  closeNonPaymentNotification(){
    this.notificationService.hideNonPaymentNotification();
  }
  closeDebtNotification(){
    this.notificationService.hideDebtNotirication();
  }
  closePendingNotification(){
    this.notificationService.hidePendingNotirication();
  }
  openAppointmentToPay(){
    this.openPaymentModal.emit();
  }
  openDebt(){
    this.openDebtModal.emit();
  }
  goPayment(){
    this.router.navigateByUrl("/admin/payments")
  }
}
