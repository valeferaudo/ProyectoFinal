import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  nonPaymentNotification: boolean = false;
  debtNotification: boolean = false;
  pendingPayment: boolean = false;
  constructor() {}

  showNonPaymentNotification() {
    this.nonPaymentNotification = true;
  }

  hideNonPaymentNotification() {
    this.nonPaymentNotification = false;
  }
  showDebtNotification() {
    this.debtNotification = true;
  }

  hideDebtNotirication() {
    this.debtNotification = false;
  }
  showPendingNotification() {
    this.pendingPayment = true;
  }

  hidePendingNotirication() {
    this.pendingPayment = false;
  }
}
